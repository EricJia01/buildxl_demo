"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var fs = require("fs");
var path = require("path");
var GraphSerializer_1 = require("./GraphSerializer");
var BxlConfig = require("./BuildXLConfigurationReader");
if (process.argv.length < 5) {
    console.log("Expected arguments: <repo-folder> <path-to-output-graph> <path-to-yarn>");
    process.exit(1);
}
// argv[0] is 'node', argv[1] is 'main.js'
var repoFolder = process.argv[2];
var outputGraphFile = process.argv[3];
var pathToYarn = process.argv[4];
var testJson = undefined;
// Unit tests may write a path to a JSON file that can be read here to parse a custom json payload to test older yarn formats.
if (process.argv.length === 6) {
    testJson = fs.readFileSync(process.argv[5], "utf8");
}
function readPackageJson(location) {
    return JSON.parse(fs.readFileSync(path.join(location, "package.json"), "utf8"));
}
try {
    /**
     * New versions of yarn return a workspace dependency tree in the following format:
     * {
     *     'workspaceName' : {
     *         location: 'some/location',
     *         workspaceDependencies: [],
     *         mismatchedWorkspaceDependencies: []
     *     }
     * }
     *
     * Older versions of yarn return the following format instead where the data key contains json as seen above:
     * {
     *     type: 'log',
     *     data: '{ 'workspaceName' : { location: 'some/location', workspaceDependencies: [], mismatchedWorkspaceDependencies: [] } }'
     * }
     */
    var workspaceJson = JSON.parse(testJson === undefined
        ? child_process_1.execSync("\"" + pathToYarn + "\" --silent workspaces info --json").toString()
        : testJson);
    // Parse the data key if the old format is found.
    if ("type" in workspaceJson && workspaceJson["type"] === "log") {
        workspaceJson = JSON.parse(workspaceJson["data"]);
    }
    var workspaces_1 = workspaceJson;
    var projects = Object.keys(workspaces_1).map(function (workspaceKey) {
        var _a = workspaces_1[workspaceKey], location = _a.location, workspaceDependencies = _a.workspaceDependencies;
        var projectFolder = path.join(repoFolder, location);
        var packageJson = readPackageJson(location);
        var bxlConfig = BxlConfig.getBuildXLConfiguration(repoFolder, projectFolder);
        return {
            name: workspaceKey,
            projectFolder: projectFolder,
            dependencies: workspaceDependencies,
            availableScriptCommands: packageJson.scripts,
            tempFolder: repoFolder,
            outputDirectories: bxlConfig.outputDirectories,
            sourceFiles: bxlConfig.sourceFiles,
        };
    });
    var graph = { projects: projects };
    GraphSerializer_1.serializeGraph(graph, outputGraphFile);
}
catch (Error) {
    // Standard error from this tool is exposed directly to the user.
    // Catch any exceptions and just print out the message.
    console.error(Error.message);
    process.exit(1);
}
//# sourceMappingURL=main.js.map
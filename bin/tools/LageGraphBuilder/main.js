"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var path = require("path");
var BxlConfig = require("./BuildXLConfigurationReader");
var GraphSerializer_1 = require("./GraphSerializer");
// String value "undefined" can be passed in for the 6th argument. Office implementation will use this to pass the lage location.
if (process.argv.length < 7) {
    console.log("Expected arguments: <repo-folder> <path-to-output-graph> <npm Location> <list-of-targets> <Lage Location>");
    process.exit(1);
}
// argv[0] is 'node', argv[1] is 'main.js'
var repoFolder = process.argv[2];
var outputGraphFile = process.argv[3];
var npmLocation = process.argv[4];
var targets = process.argv[5];
var lageLocation = process.argv[6] === "undefined" ? undefined : process.argv[6];
function lageToBuildXL(lage) {
    var projects = lage.data.packageTasks.map(function (task) {
        var commands = {};
        commands[task.task] = task.command.join(" ");
        var projectFolder = path.join(repoFolder, task.workingDirectory);
        var bxlConfig = BxlConfig.getBuildXLConfiguration(repoFolder, projectFolder);
        var project = {
            name: task.id,
            projectFolder: projectFolder,
            dependencies: task === undefined ? [] : task.dependencies,
            availableScriptCommands: commands,
            tempFolder: repoFolder,
            outputDirectories: bxlConfig.outputDirectories,
            sourceFiles: bxlConfig.sourceFiles
        };
        return project;
    });
    return {
        projects: projects
    };
}
try {
    var script = lageLocation === undefined ? npmLocation + " run lage --silent --" : "" + lageLocation;
    script = script + " info " + targets + " --reporter json";
    console.log("Starting lage export: " + script);
    var lageJson = child_process_1.execSync(script).toString();
    var lageReport = JSON.parse(lageJson);
    console.log('Finished lage export');
    var graph = lageToBuildXL(lageReport);
    GraphSerializer_1.serializeGraph(graph, outputGraphFile);
}
catch (Error) {
    // Standard error from this tool is exposed directly to the user.
    // Catch any exceptions and just print out the message.
    console.error(Error.message);
    process.exit(1);
}
//# sourceMappingURL=main.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
/**
 * The name of the configuration that decorates a JavaScript project with
 * bxl-specific information
 */
var bxlConfigurationFilename = "bxlconfig.json";
/**
 * Paths can start with this token to denote the root of the repo
 */
var workspaceDirStartToken = "<workspaceDir>/";
/**
 * Reads an optional Bxl JavaScript configuration file for a given project  and returns it
 * @param repoFolder The root of the repo
 * @param projectFolder The root of the project
 */
function getBuildXLConfiguration(repoFolder, projectFolder) {
    var pathToConfig = path.join(projectFolder, bxlConfigurationFilename);
    // This is an optional file, so if it is not there, just return an empty configuration
    if (!fs.existsSync(pathToConfig)) {
        return { outputDirectories: [], sourceFiles: [] };
    }
    var configJson = undefined;
    try {
        var configContent = fs.readFileSync(pathToConfig).toString();
        configJson = JSON.parse(configContent);
    }
    catch (error) {
        throw new Error("An error was encountered trying to read BuildXL configuration file at '" + pathToConfig + "'. Details: " + error.message);
    }
    var outputDirectories = processPathsWithScripts(configJson["outputDirectories"], repoFolder, projectFolder);
    var sourceFiles = processPathsWithScripts(configJson["sourceFiles"], repoFolder, projectFolder);
    return { outputDirectories: outputDirectories, sourceFiles: sourceFiles };
}
exports.getBuildXLConfiguration = getBuildXLConfiguration;
function processPathsWithScripts(paths, repoFolder, projectFolder) {
    var pathsWithTargets = [];
    if (!paths) {
        return [];
    }
    for (var _i = 0, paths_1 = paths; _i < paths_1.length; _i++) {
        var path_1 = paths_1[_i];
        if (typeof path_1 === "string") {
            pathsWithTargets.push({ path: processPath(repoFolder, projectFolder, path_1) });
        }
        else {
            pathsWithTargets.push({
                path: processPath(repoFolder, projectFolder, path_1.path),
                targetScripts: path_1.targetScripts
            });
        }
    }
    return pathsWithTargets;
}
/** Resolves the path such that it is always an absolute path (or undefined) */
function processPath(workspaceFolder, projectFolder, aPath) {
    if (!aPath) {
        return undefined;
    }
    if (aPath.indexOf(workspaceDirStartToken) == 0) {
        return path.join(workspaceFolder, aPath.substring(workspaceDirStartToken.length));
    }
    if (!path.isAbsolute(aPath)) {
        return path.join(projectFolder, aPath);
    }
    return aPath;
}
//# sourceMappingURL=BuildXLConfigurationReader.js.map
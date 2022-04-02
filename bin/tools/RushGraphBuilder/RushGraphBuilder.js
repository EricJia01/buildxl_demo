"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var semver = require("semver");
var BxlConfig = require("./BuildXLConfigurationReader");
/**
 * Builds a RushGraph from a valid rush configuration file
 */
function buildGraph(rushConfigurationFile, pathToRushLib) {
    var rushLib;
    try {
        rushLib = require(path.join(pathToRushLib, "@microsoft/rush-lib"));
    }
    catch (error) {
        throw new Error("Cannot find @microsoft/rush-lib module under '" + pathToRushLib + "'. This module is required to compute the Rush project graph. Details: " + error);
    }
    // Load Rush configuration, which includes the build graph
    var rushConf = rushLib.RushConfiguration.loadFromConfigurationFile(rushConfigurationFile);
    // Map each rush project into a RushProject node
    var projects = [];
    for (var _i = 0, _a = rushConf.projects; _i < _a.length; _i++) {
        var project = _a[_i];
        var dependencies = getDependencies(rushLib.Rush.version, rushConf, project);
        var bxlConfig = BxlConfig.getBuildXLConfiguration(rushConf.rushJsonFolder, project.projectFolder);
        var p = {
            name: project.packageName,
            projectFolder: project.projectFolder,
            dependencies: dependencies,
            availableScriptCommands: project.packageJson.scripts,
            tempFolder: project.projectRushTempFolder,
            outputDirectories: bxlConfig.outputDirectories,
            sourceFiles: bxlConfig.sourceFiles
        };
        projects.push(p);
    }
    return {
        projects: projects,
        configuration: { commonTempFolder: rushConf.commonTempFolder }
    };
}
exports.buildGraph = buildGraph;
function getDependencies(rushLibVersion, configuration, project) {
    // Starting from Rush version >= 5.30.0, there is built-in support to get the list of local referenced projects
    if (semver.gte(rushLibVersion, "5.30.0")) {
        return project.localDependencyProjects.map(function (rushConfProject) { return rushConfProject.packageName; });
    }
    else {
        return Array.from(getDependenciesLegacy(configuration, project));
    }
}
function getDependenciesLegacy(configuration, project) {
    var dependencies = new Set();
    // Collect all dependencies and dev dependencies 
    for (var dependencyName in project.packageJson.dependencies) {
        var version = project.packageJson.dependencies[dependencyName];
        var dependency = getDependency(dependencyName, version, project, configuration);
        if (dependency) {
            dependencies.add(dependency);
        }
    }
    for (var devDependencyName in project.packageJson.devDependencies) {
        var version = project.packageJson.devDependencies[devDependencyName];
        var dependency = getDependency(devDependencyName, version, project, configuration);
        if (dependency) {
            dependencies.add(dependency);
        }
    }
    return dependencies;
}
/**
 * Gets a dependency from a give rush project only if it is not a cyclic one and semver is satisfied
 */
function getDependency(name, version, project, configuration) {
    if (!project.cyclicDependencyProjects.has(name) &&
        configuration.projectsByName.has(name)) {
        var dependencyProject = configuration.projectsByName.get(name);
        if (semver.satisfies(dependencyProject.packageJson.version, version)) {
            return dependencyProject.packageName;
        }
    }
    return undefined;
}
//# sourceMappingURL=RushGraphBuilder.js.map
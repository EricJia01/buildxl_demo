"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RushGraphBuilder_1 = require("./RushGraphBuilder");
var GraphSerializer_1 = require("./GraphSerializer");
if (process.argv.length < 5) {
    console.log("Expected arguments: <path-to-rush.json> <path-to-output-graph> <path-to-rush-lib>");
    process.exit(1);
}
// argv[0] is 'node', argv[1] is 'main.js'
var rushJsonFile = process.argv[2];
var outputGraphFile = process.argv[3];
var pathToRushLibBase = process.argv[4];
try {
    var graph = RushGraphBuilder_1.buildGraph(rushJsonFile, pathToRushLibBase);
    GraphSerializer_1.serializeGraph(graph, outputGraphFile);
}
catch (Error) {
    // Standard error from this tool is exposed directly to the user.
    // Catch any exceptions and just print out the message.
    console.error(Error.message);
    process.exit(1);
}
//# sourceMappingURL=main.js.map
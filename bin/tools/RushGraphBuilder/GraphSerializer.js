"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
/**
 * Serializes a JavaScriptGraph into a given output path as a JSON object
 */
function serializeGraph(graph, outputPath) {
    var data = JSON.stringify(graph, null, 2);
    fs.writeFileSync(outputPath, data);
}
exports.serializeGraph = serializeGraph;
//# sourceMappingURL=GraphSerializer.js.map
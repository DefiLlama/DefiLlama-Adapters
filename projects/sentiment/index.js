const v1 = require("./v1");
const v2 = require("./v2");
const { mergeExports } = require("../helper/utils");

module.exports = mergeExports([v1, v2]);
module.exports.hallmarks = [
  ["2023-04-04", "1M hack"],
];

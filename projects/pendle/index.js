const v1 = require("./v1.js");
const v2 = require("./v2.js");
const { mergeExports } = require("../helper/utils");


module.exports = mergeExports([v1, v2])

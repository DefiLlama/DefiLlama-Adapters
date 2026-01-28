const v1 = require("./v1.js");
const v3 = require("./v3.js");
const { mergeExports } = require("../helper/utils");


module.exports = mergeExports([v1, v3])

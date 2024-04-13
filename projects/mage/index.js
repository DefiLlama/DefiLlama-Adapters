const { methodology, usdCompoundExports } = require("../helper/compound");

module.exports = {
  merlin: usdCompoundExports(
    "0xCE3bcCd2b0A457782f79000Be1b534C04B3F5aDD",
    "merlin",
    "0xe3b51f15dc086fba15426b8d42b4cd6feb46968e"
  ),
  methodology,
};


const { compoundExports } = require("../helper/compound");
const { nullAddress } = require("../helper/tokenMapping");

module.exports = {
  fantom: compoundExports('0x56644FA0fCfA09b2a04F659E499847611A8AD176', 'fantom', '0xbb2d100865d4286c94D72d78523747abf84669E9', nullAddress)
};
module.exports.fantom.borrowed = ()  => ({})
module.exports.deadFrom = '2025-05-01' 

const { compoundExports2 } = require("../helper/compound");
const { mergeExports } = require("../helper/utils");

module.exports = mergeExports([{
  mode: compoundExports2({ comptroller: '0xfb3323e24743caf4add0fdccfb268565c0685556' })
}, {
  mode: compoundExports2({ comptroller: '0x8fb3d4a94d0aa5d6edaac3ed82b59a27f56d923a' })
}])
const { compoundExports } = require("../helper/compound");

const checkForLPTokens = i => /-LP/.test(i)
module.exports = {
  kcc: compoundExports("0xfbAFd34A4644DC4f7c5b2Ae150279162Eb2B0dF6", "kcc", undefined, undefined, undefined, checkForLPTokens)
}
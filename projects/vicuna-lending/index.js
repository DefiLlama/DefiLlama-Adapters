const { aaveExports, methodology } = require("../helper/aave")
const { mergeExports } = require("../helper/utils")

const dataProviders = [
  '0xc67850eCd0EC9dB4c0fD65C1Ad43a53025e6d54D', // Main market
  // '0xe78536507675de30D375C6d2B5dA1a99819Ea9fa', // Paused market
  // '0x94e8122dF227B34998Ba7523ad88c943191cF4F1', // Paused market
  '0x08Dd992108ef0a82E8aDC633bcB3A20092e17E0B', // Stream market (xUSD)
  '0x14DF199Dc8406D1C2F87499743F3e88d17976628', // StableJack market (YT-scUSD)
  '0x7c0F1fdB80Ff25d9E5AdfA86b5Dad8c4EF93Ef90'  // Brunch market (sbUSD)
]

module.exports = mergeExports(dataProviders.map(address => ({
  sonic: aaveExports(undefined, undefined, undefined, [address], { v3: true }),
})))

module.exports.methodology = methodology
module.exports.hallmarks = [
  ['2025-03-28', "Oracle Manipulation Exploit"],
]

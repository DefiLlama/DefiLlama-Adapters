const { aaveExports, methodology } = require("../helper/aave")
const { mergeExports } = require("../helper/utils")

const dataProviders = [
  '0xc67850eCd0EC9dB4c0fD65C1Ad43a53025e6d54D',  // Main market
  '0x08Dd992108ef0a82E8aDC633bcB3A20092e17E0B',  // Stream market (xUSD)
  '0x14DF199Dc8406D1C2F87499743F3e88d17976628',  // StableJack market (YT-scUSD)
  '0x7c0F1fdB80Ff25d9E5AdfA86b5Dad8c4EF93Ef90'   // Brunch market (sbUSD)
]

module.exports = mergeExports(dataProviders.map(address => ({
  sonic: aaveExports(undefined, undefined, undefined, [address], { v3: true }),
})))

module.exports.methodology = methodology

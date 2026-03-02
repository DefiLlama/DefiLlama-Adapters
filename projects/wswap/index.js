const { getUniTVL } = require('../helper/unknownTokens')

const config = {
  wchain: "0x2A44f013aD7D6a1083d8F499605Cf1148fbaCE31",
  ethereum: "0x46B0B17Bb1f637CcfFA9fCc34bD591E3A0fF58F9",
  bsc: "0x5105989c863e801fC610396529BE9f2A6B95bF0A",
}

module.exports = {
  methodology: `
    TVL includes liquidity from WSwap V2 factories on:
    - W Chain
    - Ethereum
    - BNB Chain
  `,
}

for (const [chain, factory] of Object.entries(config)) {
  module.exports[chain] = {
    tvl: getUniTVL({
      factory,
      chain,
      useDefaultCoreAssets: true,
    })
  }
}

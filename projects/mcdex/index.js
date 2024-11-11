const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

async function ethereum(timestamp, block) {
  return sumTokens2({ block, owner: '0x220a9f0DD581cbc58fcFb907De0454cBF3777f76', tokens: [nullAddress] })
}

module.exports = {
  methodology: `Includes all locked liquidity in AMM pools, pulling the data from the mcdex subgraph`,
  ethereum: {
    tvl: ethereum
  },
}

const config = {
  arbitrum: { factory: "0xA017B813652b93a0aF2887913EFCBB4ab250CE65", fromBlock: 219937, },
  bsc: { factory: "0xfb4cd1bf5c5919a29fb894c8ddc4a69a36f5ec87", fromBlock: 11137817, },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({
        api,
        factory,
        eventAbi: 'event CreateLiquidityPool(bytes32 versionKey, address indexed liquidityPool, address indexed governor, address indexed operator, address shareToken, address collateral, uint256 collateralDecimals, bytes initData)',
        fromBlock,
      })
      return api.sumTokens({ tokensAndOwners: logs.map(log => [log.collateral, log.liquidityPool]) })
    }
  }
})

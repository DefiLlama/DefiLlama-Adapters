const { sumTokens2, sumTokensExport } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

const chain = 'arbitrum'

async function tvl(timestamp, _b, chainBlocks, { api }) {
  const logs = await getLogs({
    api,
    fromBlock: 33934273,
    eventAbi: 'event MarketCreated(uint256 indexed mIndex, address hedge, address risk, address token, string name, int256 strikePrice)',
    topics: ['0xf38f00404415af51ddd0dd57ce975d015de2f40ba8a087ac48cd7552b7580f32'],
    target: '0x984e0eb8fb687afa53fc8b33e12e04967560e092',
  })

  const vaults = logs.map(({ args }) => ([args.hedge, args.risk])).flat()
  const tokens = await api.multiCall({
    abi: 'address:asset',
    calls: vaults,
  })
  const tokensAndOwners = tokens.map((token, i) => ([token, vaults[i]]))

  return sumTokens2({ api, tokensAndOwners })
}

const config = {
  arbitrum: { factory: '0xC3179AC01b7D68aeD4f27a19510ffe2bfb78Ab3e', fromBlock:   96059531 , },
}


Object.keys(config).forEach(chain => {
  const { factory, fromBlock} = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const logs = await getLogs({
        api,
        target: factory,
        topics: ['0xe8066e93c2c1e100c0c76002a546075b7c6b53025db53708875180c81afda250'],
        eventAbi: 'event MarketCreated (uint256 indexed marketId, address premium, address collateral, address underlyingAsset, address token, string name, uint256 strike, address controller)',
        onlyArgs: true,
        fromBlock,
      })
      const premiums = logs.map(i => i.premium)
      const collaterals = logs.map(i => i.collateral)
      const pTokens = await api.multiCall({  abi: 'address:asset', calls: premiums })
      const cTokens = await api.multiCall({  abi: 'address:asset', calls: collaterals })
      return sumTokens2({ api, tokensAndOwners2: [[...pTokens, ...cTokens], [...premiums, ...collaterals]] })
    }
  }
})


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


module.exports = {
  arbitrum: {
    tvl,
    // staking: sumTokensExport({ chain, owners: [], tokens: ['0x65c936f008BC34fE819bce9Fa5afD9dc2d49977f']}),
    pool2: sumTokensExport({ chain, owners: ['0xaefd22d0153e69f3316dca9095e7279b3a2f8af2', '0xbDAA858Fd7b0DC05F8256330fAcB35de86283cA0',], tokens: ['0x569061e2d807881f4a33e1cbe1063bc614cb75a4']})
  }
}

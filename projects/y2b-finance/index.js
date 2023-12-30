const { sumTokens2, sumTokensExport } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

async function tvl(timestamp, _b, chainBlocks, { api }) {
  const logs = await getLogs({
    api,
    fromBlock: 16310967,
    eventAbi: 'event MarketCreated(uint256 indexed mIndex, address hedge, address risk, address token, string name, int256 strikePrice)',
    topics: ['0xf38f00404415af51ddd0dd57ce975d015de2f40ba8a087ac48cd7552b7580f32'],
    target: '0xF33C13DA4425629C3F10635E4f935D8020F97D1f',
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
  hallmarks: [
    [1673913600, "Rug Pull"]
  ],
    ethereum: {
    tvl,
    // staking: sumTokensExport({ owners: [], tokens: ['0xF9C12B27cE5058ab98ce11BD53900f84E18C0650']})
  }
}

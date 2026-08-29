const { ChainApi } = require('@defillama/sdk')

// BSC mainnet DataStore: https://bscscan.com/address/0xc244A37A17CE7aa14E1BDD73f6a047Ed6B56f6B8
const DATA_STORE = '0xc244A37A17CE7aa14E1BDD73f6a047Ed6B56f6B8'
// BSC mainnet Reader: https://bscscan.com/address/0xFC370bA161F4B54B12574c7e0a2121Cea57854A1
const READER = '0xFC370bA161F4B54B12574c7e0a2121Cea57854A1'
// Upper bound for Reader pagination; the current deployment has four markets.
const MAX_MARKETS = 1000

const GET_MARKETS_ABI = 'function getMarkets(address dataStore, uint256 start, uint256 end) view returns (tuple(address marketToken, address indexToken, address longToken, address shortToken)[])'

// BSC mainnet token contracts:
// HFUSD: https://bscscan.com/address/0x7F7AD43d1Baa6BeA7f53F72D97D90b4FC0f662DF
// HFUSD1: https://bscscan.com/address/0x026C39Ab4B07f4C8C62b5824F0F9D7BE5087405a
// U: https://bscscan.com/address/0xcE24439F2D9C6a2289F741120FE202248B666666
// USD1: https://bscscan.com/address/0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d
const HFUSD = '0x7F7AD43d1Baa6BeA7f53F72D97D90b4FC0f662DF'
const HFUSD1 = '0x026C39Ab4B07f4C8C62b5824F0F9D7BE5087405a'
const U = '0xcE24439F2D9C6a2289F741120FE202248B666666'
const USD1 = '0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d'

const WRAPPER_TO_UNDERLYING = {
  [HFUSD.toLowerCase()]: U,
  [HFUSD1.toLowerCase()]: USD1,
}

async function tvl(api) {
  // Discover the current market list at the latest block, then read balances
  // through the timestamp-pinned api so historical TVL remains accurate.
  const latestApi = new ChainApi({ chain: api.chain })
  const markets = await latestApi.call({
    target: READER,
    abi: GET_MARKETS_ABI,
    params: [DATA_STORE, 0, MAX_MARKETS],
  })

  const marketTokens = new Map()
  for (const market of markets) {
    const marketToken = market.marketToken ?? market[0]
    const longToken = market.longToken ?? market[2]
    const shortToken = market.shortToken ?? market[3]

    for (const token of new Set([longToken, shortToken])) {
      const underlying = WRAPPER_TO_UNDERLYING[token.toLowerCase()]
      if (!underlying) throw new Error(`Unsupported HertzFlow market token: ${token}`)
      marketTokens.set(`${marketToken.toLowerCase()}:${token.toLowerCase()}`, {
        market: marketToken,
        token,
        underlying,
      })
    }
  }

  const positions = [...marketTokens.values()]
  const balances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: positions.map(({ market, token }) => ({ target: token, params: [market] })),
  })

  balances.forEach((balance, index) => api.add(positions[index].underlying, balance))
}

module.exports = {
  methodology: 'Counts the U and USD1 backing assets held by active HertzFlow market pools. HFUSD and HFUSD1 balances are mapped 1:1 to their underlying assets. HLV vault shares are excluded because they represent claims on the same market liquidity.',
  start: '2026-08-14',
  bsc: { tvl },
}

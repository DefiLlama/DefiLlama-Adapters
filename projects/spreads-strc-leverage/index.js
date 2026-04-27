// Spreads STRC Leverage — Morpho V2 fork deployed by Spreads on Ink. The
// 'money market' contract is a private Morpho Blue instance (NOT the canonical
// 0x857f… deployment), so its TVL is unique to Spreads. Collateral is wSTRC
// (1:1 wrapper of STRCx, Strategy's tokenized preferred share); loan asset is
// USDC. wSTRC pricing is configured server-side via the canonical STRCx
// CoinGecko mapping.

const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')
const morphoAbi = require('../helper/abis/morpho.json').morphoBlueFunctions

const MONEY_MARKET = '0x1256bC6D44a4BAf5C67712e3EA6eD1b02758Fb9f'
const FROM_BLOCK = 38000000

const CREATE_MARKET_EVENT =
  'event CreateMarket(bytes32 indexed id, (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv) marketParams)'

async function getMarketIds(api) {
  const logs = await getLogs2({
    api, target: MONEY_MARKET, fromBlock: FROM_BLOCK,
    eventAbi: CREATE_MARKET_EVENT,
  })
  return logs.map(l => l.id.toLowerCase())
}

module.exports = {
  methodology:
    'TVL sums collateral and idle loan-asset balances at the Spreads money-market contract (Morpho fork on Ink). All markets are enumerated from CreateMarket events; tokens (loan + collateral per market) are summed at the contract. Borrowed reports outstanding loan debt per market via market().totalBorrowAssets.',
  ink: {
    tvl: async (api) => {
      const ids = await getMarketIds(api)
      const params = await api.multiCall({ target: MONEY_MARKET, abi: morphoAbi.idToMarketParams, calls: ids })
      const tokens = [...new Set(params.flatMap(p => [p.loanToken, p.collateralToken]))]
      return sumTokens2({ api, owner: MONEY_MARKET, tokens })
    },
    borrowed: async (api) => {
      const ids = await getMarketIds(api)
      const [params, states] = await Promise.all([
        api.multiCall({ target: MONEY_MARKET, abi: morphoAbi.idToMarketParams, calls: ids }),
        api.multiCall({ target: MONEY_MARKET, abi: morphoAbi.market, calls: ids }),
      ])
      states.forEach((s, i) => api.add(params[i].loanToken, s.totalBorrowAssets))
    },
  },
}

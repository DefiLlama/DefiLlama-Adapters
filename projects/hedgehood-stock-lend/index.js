const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// StockLend by HedgeHood (hedgehood.io/loan): isolated stock-lending markets on Robinhood Chain. Lenders deposit a
// stock token; a borrower posts collateral (USDG, or SGOV / SPY on two retired markets), borrows the stock for a
// fixed term and pays an opening fee and a time fee in the collateral token. Each market is one contract that holds
// the idle stock and all collateral.
const MARKETS = [
  '0x4977c00783605750789cEEc5A3cbfaEDA3f015DB', // SPCX
  '0x426A79a122c6A0A47fE2F5c5F41C4BC4d102c414', // NVDA
  '0x0Ac2B1411E4c0623D936DD3E8586eA5EeF1eADB2', // MU
  '0x8e8f3CC988e0D56C52a49F3055aacd62ef1b970c', // GME
  '0x5C88B4f4a1acBBb1E5E63d4414bc194477bD2A7a', // CRCL
  '0x6Ddc8f2dE5DCe2ff2EAc2c12CD96C936948C2912', // USO
  // retired: closed to new loans, lenders and borrowers can still exit
  '0x118266F880d8A99c8D4F3E507B87c6CabdDF2339', // GME v1
  '0x028727fcf3b76Bcc1a1877100f77a38A73B9eb35', // GME v2
  '0x4BC618Fd846602113D494d5f86A0B915257d8d10', // SPCX v2
  '0xD233AC577cd0010A7B67EF2d0DA0447FD02375f8', // GME v3, SGOV collateral
  '0x412a33d1266B5D408191E66b31c372580d9168c8', // GME v3, SPY collateral
  '0x3D15BB430a70c3dD4ADf329ee7E089885a887e09', // GME v3
]

async function tokens(api) {
  const [stocks, collaterals] = await Promise.all([
    api.multiCall({ abi: 'address:stock', calls: MARKETS, permitFailure: true }),
    api.multiCall({ abi: 'address:collateral', calls: MARKETS, permitFailure: true }),
  ])
  // the first market versions (GME v1/v2, SPCX v2) take USDG only and have no collateral() getter
  return { stocks, collaterals: collaterals.map((token) => token ?? ADDRESSES.robinhood.USDG) }
}

// idle lender stock and borrowers' collateral, both held by the market
async function tvl(api) {
  const { stocks, collaterals } = await tokens(api)
  const tokensAndOwners = MARKETS.flatMap((market, i) => [[stocks[i], market], [collaterals[i], market]]).filter(([token]) => token)
  return sumTokens2({ api, tokensAndOwners })
}

// stock out on loan
async function borrowed(api) {
  const { stocks } = await tokens(api)
  const lent = await api.multiCall({ abi: 'uint256:lentOut', calls: MARKETS, permitFailure: true })
  lent.forEach((amount, i) => { if (stocks[i] && amount) api.add(stocks[i], amount) })
}

module.exports = {
  methodology:
    'TVL counts what each StockLend market holds: the stock lenders deposited that is not lent out, and the collateral borrowers posted (USDG; SGOV or SPY on two retired markets). Borrowed counts the stock out on loan (lentOut).',
  start: '2026-09-07', // the earliest market with a recorded deployment block (57171859),
  robinhood: { tvl, borrowed },
}

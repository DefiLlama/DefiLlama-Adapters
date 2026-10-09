const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

// Every market is an immutable VSMarket contract that custodies USDG collateral
// backing outstanding complete sets (1 USDG = 1 A + 1 B) plus the AMM pool.
const FACTORY = '0xE96F3d1F98f91842EA209acA197844040E241990'

async function tvl(api) {
  const markets = await api.call({ target: FACTORY, abi: 'address[]:allMarkets' })
  if (!markets.length) return api.getBalances()

  // Protocol fees accrue inside each market until swept to the treasury; they are
  // not user collateral, so subtract them from the raw USDG balance.
  const accruedFees = await api.multiCall({ abi: 'uint256:accruedFees', calls: markets })
  await sumTokens2({ api, owners: markets, tokens: [ADDRESSES.robinhood.USDG] })
  accruedFees.forEach((fee) => api.add(ADDRESSES.robinhood.USDG, -BigInt(fee)))
}

module.exports = {
  methodology:
    'TVL is the USDG collateral held by every VSMarket contract created by the VS factory ' +
    '(minus protocol fees accrued but not yet swept to the treasury). Each market holds ' +
    '1 USDG for every outstanding complete set of outcome shares, plus the AMM pool liquidity.',
  start: '2026-09-03',
  robinhood: { tvl },
}

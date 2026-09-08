const { sumTokens2 } = require('../helper/unwrapLPs')

// VS — onchain relative-performance markets on Robinhood Chain (chainId 4663).
// Every market is an immutable VSMarket contract that custodies USDG collateral
// backing outstanding complete sets (1 USDG = 1 A + 1 B) plus the AMM pool.
// The factory keeps the canonical list of markets.
const FACTORY = '0xE96F3d1F98f91842EA209acA197844040E241990'
const USDG = '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168'

async function tvl(api) {
  const markets = await api.call({ target: FACTORY, abi: 'address[]:allMarkets' })
  if (!markets.length) return api.getBalances()

  // Protocol fees accrue inside each market until swept to the treasury; they are
  // not user collateral, so subtract them from the raw USDG balance.
  const accruedFees = await api.multiCall({ abi: 'uint256:accruedFees', calls: markets })
  await sumTokens2({ api, owners: markets, tokens: [USDG] })
  accruedFees.forEach((fee) => api.add(USDG, -BigInt(fee)))
  return api.getBalances()
}

module.exports = {
  methodology:
    'TVL is the USDG collateral held by every VSMarket contract created by the VS factory ' +
    '(minus protocol fees accrued but not yet swept to the treasury). Each market holds ' +
    '1 USDG for every outstanding complete set of outcome shares, plus the AMM pool liquidity.',
  start: 1788478718, // 2026-09-03, factory deployment (block 53808598)
  robinhood: { tvl },
}

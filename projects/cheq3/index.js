const { sumTokens2 } = require('../helper/unwrapLPs')

// Shielded USDG pool. Idle USDG above its liquidity buffer is supplied to COMET, so it is counted there
const POOL = '0xe8becbd70d13a258a0082f67e0ed776e8c46b495'
// CHEQ3's own Comet (Compound v3) credit engine, USDG base
const COMET = '0xdbB9c485029D9A1D3b1d36Edb8Ad5ad851B03fC7'

const abi = {
  getAssetInfo: 'function getAssetInfo(uint8 i) view returns (tuple(uint8 offset, address asset, address priceFeed, uint64 scale, uint64 borrowCollateralFactor, uint64 liquidateCollateralFactor, uint64 liquidationFactor, uint128 supplyCap))',
}

/**
 * USDG held by the pool, plus the USDG and every listed collateral asset held by the Comet engine.
 * The pool supplies its idle USDG to that engine, so those funds are counted once, in the engine.
 */
async function tvl(api) {
  const [poolToken, baseToken, assets] = await Promise.all([
    api.call({ target: POOL, abi: 'address:token' }),
    api.call({ target: COMET, abi: 'address:baseToken' }),
    api.fetchList({ target: COMET, lengthAbi: 'uint8:numAssets', itemAbi: abi.getAssetInfo }),
  ])
  return sumTokens2({
    api,
    ownerTokens: [
      [[poolToken], POOL],
      [[baseToken, ...assets.map(a => a.asset)], COMET],
    ],
  })
}

/**
 * USDG owed to the Comet engine (`totalBorrow`), reported apart from TVL.
 */
async function borrowed(api) {
  const [baseToken, totalBorrow] = await Promise.all([
    api.call({ target: COMET, abi: 'address:baseToken' }),
    api.call({ target: COMET, abi: 'uint256:totalBorrow' }),
  ])
  api.add(baseToken, totalBorrow)
}

module.exports = {
  methodology: 'TVL is the USDG held by the CHEQ3 shielded pool plus the USDG and collateral (WETH, SGOV and Robinhood tokenized stocks and ETFs) held by CHEQ3\'s own Comet credit engine. The pool supplies its idle USDG to that engine, so those funds are counted once, in the engine. Borrowed is the engine\'s outstanding USDG debt.',
  start: '2026-09-24',
  robinhood: { tvl, borrowed },
}

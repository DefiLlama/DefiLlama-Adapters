const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')

// TETRAVAULT on Robinhood Chain: TETRA is backed by a redeemable reserve of tokenised stocks (SPY),
// gold (GLD), oil (USO), ETH (WETH) and USDG cash held by the Reserve contract. The TETRA/USDG
// Uniswap v4 pool is protocol-owned (the hook holds the only position, locked), so its USDG side
// is reported as pool2 rather than TVL. Staked TETRA is the project's own token (staking).
const TETRA = '0x7E187fE67ae04c1B1738f01B424656390E45E1C9'
const RESERVE = '0x6681f24a6347772D9e0F861717C35cf462f6f194'
const STAKING = '0x046fb87B3de0668124f918F216987092755E0004'
const HOOK = '0x8EE7f46b728628bBf007802A8B3Cc04e594f68CC'

const SPY = '0x117cc2133c37B721F49dE2A7a74833232B3B4C0C'
const GLD = '0xC9a981FEE1F9DEc688bb123ccDeCc63D0deBFC4e'
const { USO, WETH, USDG } = ADDRESSES.robinhood

async function tvl(api) {
  return sumTokens2({ api, owner: RESERVE, tokens: [SPY, GLD, USO, WETH, USDG] })
}

// USDG inside the protocol-owned TETRA/USDG v4 position, read from the hook (the PoolManager is a
// singleton, so its token balance is chain-wide and not usable here).
async function pool2(api) {
  const [, usdg] = await api.call({ target: HOOK, abi: 'function protocolPoolAmounts() view returns (uint256 vaultAmt, uint256 usdgAmt)' })
  api.add(USDG, usdg)
}

module.exports = {
  methodology: 'TVL is the reserve that backs TETRA: SPY, GLD, USO, WETH and USDG held by the Reserve contract (redeemable pro rata by burning TETRA). Pool2 is the USDG side of the protocol-owned TETRA/USDG Uniswap v4 position, read from the hook. Staking is TETRA held by the staking contract.',
  start: '2026-10-21',
  robinhood: {
    tvl,
    pool2,
    staking: staking(STAKING, TETRA),
  },
}

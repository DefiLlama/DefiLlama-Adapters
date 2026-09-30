const { sumTokens2 } = require('../helper/unwrapLPs')

// Motoswap on Ethereum mainnet.
// MOTO launched on 2026-09-14 together with the Vampire Attack liquidity mining campaign (VampChef).
// The Motoswap DEX (Uniswap v2 style factory) opens on 2026-09-28; a dexFactory section will be added then.

const MOTO = '0xBd965230588EAA536dE6aA45E8ebbc01638535e0'
const VAMP_CHEF = '0x51e648f08a9a08A724591938d9cbc483C809aCA4' // Vampire Attack MasterChef style farm (proxy)
const MOTO_STAKING = '0xCE88F2C6B49EfBb92555eE5475311f0e250C2528' // lock MOTO for revenue share (proxy)

// Excluded on purpose (protocol owned, not user deposits):
//   TreasuryVesting    0x5730ABdF3C06c37940FB8B5291277e62D2c15278
//   RewardVestingEscrow 0xB5B07c3007c183348AF0Ff3d4Fbc65cac3527Aed
//   the MOTO emission budget held by the chef itself

const poolInfoAbi = 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardTime, uint256 accRewardPerShare, uint256 lpSupply)'

// The chef holds its own reward budget in MOTO, so balanceOf(chef) overstates the single sided MOTO pool.
// poolInfo(pid).lpSupply is the amount actually staked by users, so it is used for every pool.
async function getStakedPools(api) {
  const poolLength = await api.call({ abi: 'uint256:poolLength', target: VAMP_CHEF })
  const pools = await api.multiCall({
    abi: poolInfoAbi,
    target: VAMP_CHEF,
    calls: Array.from({ length: +poolLength }, (_, i) => i),
  })
  return pools.filter(p => p.lpSupply !== '0')
}

function isMoto(token) {
  return token.toLowerCase() === MOTO.toLowerCase()
}

// Vampire Attack: LP tokens staked in the chef. The pairs contain MOTO, so this is pool2.
async function pool2(api) {
  const pools = await getStakedPools(api)
  pools
    .filter(p => !isMoto(p.lpToken))
    .forEach(p => api.add(p.lpToken, p.lpSupply))
  return sumTokens2({ api, resolveLP: true })
}

// MOTO staked single sided in the chef plus MOTO locked in MotoStaking.
async function staking(api) {
  const pools = await getStakedPools(api)
  pools
    .filter(p => isMoto(p.lpToken))
    .forEach(p => api.add(MOTO, p.lpSupply))
  return sumTokens2({ api, owner: MOTO_STAKING, tokens: [MOTO] })
}

// No DEX liquidity to count until the Motoswap factory opens on 2026-09-28.
async function tvl() {
  return {}
}

module.exports = {
  methodology:
    'Vampire Attack: Uniswap v2 LP tokens staked in the Motoswap farm contract are counted as pool2 (the pairs contain MOTO). ' +
    'MOTO staked single sided in the farm and MOTO locked in MotoStaking are counted as staking. ' +
    'Staked amounts are read from the farm pool accounting (lpSupply), so the MOTO reward budget held by the farm is excluded. ' +
    'Treasury vesting and reward escrow contracts are protocol owned and excluded. ' +
    'Liquidity in Motoswap DEX pairs will be counted as tvl once the DEX opens on 2026-09-28.',
  start: '2026-09-14', // 2026-09-14, block 25977433
  ethereum: {
    tvl,
    staking,
    pool2,
  },
}

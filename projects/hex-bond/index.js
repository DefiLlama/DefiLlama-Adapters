const ADDRESSES = require('../helper/coreAssets.json')
const { sumUnknownTokens } = require('../helper/unknownTokens')

const HEX = ADDRESSES.pulse.HEX

const HEX_BOND_MANAGER = '0x1eAE95554914f6221D55a1C0B199d0B57bdfB3c8'
const BOND_MIGRATOR = '0x3FaCED611A1db97D575667f68467988E94700100'
const HSI_MANAGER = '0x8BD3d1472A656e312E94fB1BbdD599B8C51D18e3'

const MASTER_CHEF = '0xdDAeC037791e524e66Da154b4F1A1673eeE61C09'
const HBRP_CHEF = '0x76e945931624171759A85789Ad6613F2e83a1383'

const MATURITIES = [2999, 3999, 4999, 5999, 6999, 7999]

const abi = {
  hsiCount: 'function hsiCount(address user) view returns (uint256)',
  hsiLists: 'function hsiLists(address user, uint256 index) view returns (address)',
  stakeDataFetch:
    'function stakeDataFetch() view returns (tuple(uint40 stakeId, uint72 stakedHearts, uint72 stakeShares, uint16 lockedDay, uint16 stakedDays, uint16 unlockedDay, bool isAutoStake))',
  maturityInfo:
    'function maturityInfo(uint16 maturity) view returns (uint72 hexBalance, address tokenAddress)',
  wrapped: 'function wrapped(uint16 maturity) view returns (uint256)',
  poolLength: 'function poolLength() view returns (uint256)',
  masterChefPoolInfo:
    'function poolInfo(uint256 pid) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardTime, uint256 accHbrPerShare, uint256 totalStaked, address strategy)',
  hbrpChefPoolInfo:
    'function poolInfo(uint256 pid) view returns (address token, uint256 allocPoint, uint256 lastRewardTime, uint16 depositFeeBP, uint16 withdrawFeeBP, uint256 accTokensPerShare, bool isStarted, uint256 lpBalance, uint256 accReferralPerShare)',
}

async function tvl(api) {
  const hsiCount = await api.call({ target: HSI_MANAGER, abi: abi.hsiCount, params: HEX_BOND_MANAGER })
  const hsiAddresses = await api.multiCall({
    target: HSI_MANAGER,
    abi: abi.hsiLists,
    calls: Array.from({ length: Number(hsiCount) }, (_, index) => ({ params: [HEX_BOND_MANAGER, index] })),
  })
  const stakes = await api.multiCall({ abi: abi.stakeDataFetch, calls: hsiAddresses })

  const [maturityInfo, wrapped] = await Promise.all([
    api.multiCall({ target: HEX_BOND_MANAGER, abi: abi.maturityInfo, calls: MATURITIES }),
    api.multiCall({ target: BOND_MIGRATOR, abi: abi.wrapped, calls: MATURITIES }),
  ])

  // HEX principal in custodied stakes, settled HEX in redemption pots, and
  // Actuator HTT claims held by the migrator (redeemable 1:1 for HEX at maturity).
  api.add(HEX, stakes.map((stake) => stake.stakedHearts))
  api.add(HEX, maturityInfo.map((info) => info.hexBalance))
  api.add(HEX, wrapped)
}

async function pool2(api) {
  const [masterChefPools, hbrpChefPools] = await Promise.all([
    api.fetchList({ target: MASTER_CHEF, lengthAbi: abi.poolLength, itemAbi: abi.masterChefPoolInfo }),
    api.fetchList({ target: HBRP_CHEF, lengthAbi: abi.poolLength, itemAbi: abi.hbrpChefPoolInfo }),
  ])
  masterChefPools.forEach((pool) => api.add(pool.lpToken, pool.totalStaked))
  hbrpChefPools.forEach((pool) => api.add(pool.token, pool.lpBalance))

  // Farm LPs pair HBR/HBRP with HEX, WPLS, PLSX or INC; each LP is valued at
  // twice its priced side. HBR and HBRP themselves are not priced.
  const lps = [...masterChefPools.map((pool) => pool.lpToken), ...hbrpChefPools.map((pool) => pool.token)]
  return sumUnknownTokens({ api, lps, useDefaultCoreAssets: true, resolveLP: true, allLps: true })
}

module.exports = {
  misrepresentedTokens: true, // Actuator HTT claims are shown as HEX
  methodology:
    'TVL counts HEX principal in active custodied HSIs, settled HEX held in maturity redemption pots, and the contractual 1:1 HEX redemption amount of Actuator HTTs held by the migrator. Pool2 counts LP principal credited to users in the HBR and HBRP farm contracts, valued at twice the priced side of each pair.',
  pulse: {
    tvl,
    pool2,
  },
}

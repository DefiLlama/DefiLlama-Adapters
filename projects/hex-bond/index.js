const { sumUnknownTokens } = require('../helper/unknownTokens')

const HEX = '0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39'
const HBR = '0xD947b662876aAaAD199826d985Dee35cad569989'
const HBRP = '0x5eA9674085a81e653FF087B4b86FaAe564a267be'

const HEX_BOND_MANAGER = '0x1eAE95554914f6221D55a1C0B199d0B57bdfB3c8'
const BOND_MIGRATOR = '0x3FaCED611A1db97D575667f68467988E94700100'
const HSI_MANAGER = '0x8BD3d1472A656e312E94fB1BbdD599B8C51D18e3'

const MASTER_CHEF = '0xdDAeC037791e524e66Da154b4F1A1673eeE61C09'
const HBRP_CHEF = '0x76e945931624171759A85789Ad6613F2e83a1383'
const HBR_STAKING = '0x54325B1580a09467d5305454C0630D7AdA8F08D8'
const HBRP_STAKING = '0x2444E2Ee7169c61Fa92EA422Ac1A93d34a248e49'

const MATURITIES = [2999, 3999, 4999, 5999, 6999, 7999]

// PulseX V2 pairs used to derive on-chain prices for HBR and HBRP.
const PRICE_LPS = [
  '0x86914eDa085B991b2D7A13eE9259c08608f440a1', // HBR/WPLS
  '0x8bF6d60e0364d6D5cC9819a81664d191baDbB92F', // HBRP/WPLS
]

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
  stakedTotal: 'function stakedTotal() view returns (uint256)',
  totalVaultStaked: 'function totalVaultStaked() view returns (uint256)',
}

function getValue(item, key, index = 0) {
  return item?.[key] ?? item?.[index] ?? item
}

function sumBigInt(values) {
  return values.reduce((total, value) => total + BigInt(value), 0n)
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

  const activeStakePrincipal = sumBigInt(stakes.map((stake) => getValue(stake, 'stakedHearts', 1)))
  const settledHex = sumBigInt(maturityInfo.map((info) => getValue(info, 'hexBalance', 0)))
  const wrappedClaims = sumBigInt(wrapped)

  api.add(HEX, activeStakePrincipal + settledHex + wrappedClaims)
}

async function getChefPositions(api, chef, poolInfoAbi, tokenKey, balanceKey, balanceIndex) {
  const poolLength = await api.call({ target: chef, abi: abi.poolLength })
  const pools = await api.multiCall({
    target: chef,
    abi: poolInfoAbi,
    calls: Array.from({ length: Number(poolLength) }, (_, index) => index),
  })

  return pools
    .map((pool) => ({
      token: getValue(pool, tokenKey, 0),
      balance: getValue(pool, balanceKey, balanceIndex),
    }))
    .filter(({ balance }) => BigInt(balance) > 0n)
}

async function pool2(api) {
  const positions = (
    await Promise.all([
      getChefPositions(api, MASTER_CHEF, abi.masterChefPoolInfo, 'lpToken', 'totalStaked', 4),
      getChefPositions(api, HBRP_CHEF, abi.hbrpChefPoolInfo, 'token', 'lpBalance', 7),
    ])
  ).flat()

  api.addTokens(
    positions.map(({ token }) => token),
    positions.map(({ balance }) => balance),
  )

  return sumUnknownTokens({
    api,
    lps: [...new Set([...positions.map(({ token }) => token), ...PRICE_LPS])],
    useDefaultCoreAssets: true,
    resolveLP: true,
    allLps: true,
  })
}

async function staking(api) {
  const [hbrSingleStake, hbrBondVaults, hbrpStake] = await Promise.all([
    api.call({ target: HBR_STAKING, abi: abi.stakedTotal }),
    api.call({ target: HBR, abi: abi.totalVaultStaked }),
    api.call({ target: HBRP_STAKING, abi: abi.stakedTotal }),
  ])

  api.add(HBR, BigInt(hbrSingleStake) + BigInt(hbrBondVaults))
  api.add(HBRP, hbrpStake)

  return sumUnknownTokens({
    api,
    lps: PRICE_LPS,
    useDefaultCoreAssets: true,
    allLps: true,
  })
}

module.exports = {
  doublecounted: true, // pool2 positions are also liquidity in PulseX V2
  misrepresentedTokens: true, // HTT claims are shown as HEX; HBR/HBRP are priced through PulseX pairs
  methodology:
    'Base TVL counts HEX principal in active custodied HSIs, settled HEX held in maturity redemption pots, and the contractual 1:1 HEX redemption amount of Actuator HTTs held by the migrator. Staking counts HBR deposited in the single-token and bond vaults plus HBRP deposited in its staking vault. Pool2 counts only LP principal credited to users in the HBR and HBRP farm contracts; this liquidity is also counted by PulseX V2.',
  pulse: {
    tvl,
    staking,
    pool2,
  },
}

const ADDRESSES = require('../helper/coreAssets.json')

// Offshore Cash — Privacy Protocol on Ethereum
// Contracts: https://etherscan.io/address/0x7dc44f4d7d13853a14b26169c8479bec3939649d

const MAINPOOL = '0x7dc44f4d7d13853a14b26169c8479bec3939649d'
const OFF_TOKEN = '0x1d0a521b57850a94abcd78ad4180764285225842'
const STAKING = '0x1df7648356f675abd79f9440f14e56c378b61f44'
const RELAYER_REGISTRY = '0x8d5ba08b1db746803da28dcda69e0065eb52d45a'
const TOKEN_VESTING = '0x914955471f2e8067548460e4ea8fd94b57a10ab0'
const TIMELOCK = '0x887d683078bf8f4fa6d3ea165f4b3e4866fe39d9'

// TVL = ETH deposited in MainPool (core protocol value locked)
async function tvl(api) {
  const balance = await api.call({
    abi: 'function tokenTVL(address) view returns (uint256)',
    target: MAINPOOL,
    params: [ADDRESSES.null],
  })
  api.add(ADDRESSES.null, balance)
}

// Staking = OFF staked in Governance Staking + RelayerRegistry collateral
async function staking(api) {
  // Governance staking (revenue share, lock 7d-4yr, multiplier 1x-2.5x)
  const governanceStaked = await api.call({
    abi: 'function totalStaked() view returns (uint256)',
    target: STAKING,
  })
  api.add(OFF_TOKEN, governanceStaked)

  // Relayer collateral (20K OFF minimum per relayer)
  const relayerStaked = await api.call({
    abi: 'erc20:balanceOf',
    target: OFF_TOKEN,
    params: [RELAYER_REGISTRY],
  })
  api.add(OFF_TOKEN, relayerStaked)
}

// Vesting = OFF locked in TokenVesting contract
// - Treasury: 65M OFF, 5-year linear vesting, 3-month cliff
// - Team: 25M OFF, 3-year linear vesting, 1-year cliff
// Both schedules managed by governance (revocable)
async function vesting(api) {
  const vestingBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: OFF_TOKEN,
    params: [TOKEN_VESTING],
  })
  api.add(OFF_TOKEN, vestingBalance)
}

// Treasury = OFF held by Timelock (governance-controlled)
async function treasury(api) {
  const timelockBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: OFF_TOKEN,
    params: [TIMELOCK],
  })
  api.add(OFF_TOKEN, timelockBalance)
}

module.exports = {
  methodology: 'TVL counts ETH deposited in the MainPool privacy contract. Staking includes OFF tokens in Governance Staking (revenue share with 7d-4yr lock, 1x-2.5x multiplier) and RelayerRegistry collateral (20K OFF per relayer). Vesting tracks OFF in TokenVesting contract: 65M Treasury (5yr linear, 3mo cliff) and 25M Team (3yr linear, 1yr cliff). Treasury shows OFF held by the governance Timelock.',
  ethereum: {
    tvl,
    staking,
    vesting,
    treasury,
  },
}

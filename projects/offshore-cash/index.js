const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

// Offshore Cash — Privacy Protocol on Ethereum
// Contracts: https://etherscan.io/address/0x7dc44f4d7d13853a14b26169c8479bec3939649d

const MAINPOOL = '0x7dc44f4d7d13853a14b26169c8479bec3939649d'
const OFF_TOKEN = '0x1d0a521b57850a94abcd78ad4180764285225842'
const STAKING = '0x1df7648356f675abd79f9440f14e56c378b61f44'
const RELAYER_REGISTRY = '0x8d5ba08b1db746803da28dcda69e0065eb52d45a'
const TOKEN_VESTING = '0x914955471f2e8067548460e4ea8fd94b57a10ab0'
const TIMELOCK = '0x887d683078bf8f4fa6d3ea165f4b3e4866fe39d9'

module.exports = {
  methodology: 'TVL counts ETH deposited in the MainPool privacy contract. Staking includes OFF tokens in Governance Staking (revenue share with 7d-4yr lock, 1x-2.5x multiplier) and RelayerRegistry collateral (20K OFF per relayer). Vesting tracks OFF in TokenVesting (65M Treasury: 5yr linear, 3mo cliff; 25M Team: 3yr linear, 1yr cliff) and Timelock (governance treasury).',
  ethereum: {
    tvl: sumTokensExport({ owner: MAINPOOL, tokens: [ADDRESSES.null] }),
    staking: sumTokensExport({ owners: [STAKING, RELAYER_REGISTRY], tokens: [OFF_TOKEN] }),
    vesting: sumTokensExport({ owners: [TOKEN_VESTING, TIMELOCK], tokens: [OFF_TOKEN] }),
  },
}

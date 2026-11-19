const sdk = require('@defillama/sdk')
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens } = require('../helper/chain/bitcoin')

// Diamond Hands: BTC-collateralised loans that mint the UCD stablecoin on Ethereum.
// Each loan's BTC sits in its own native Bitcoin vault address, recorded on-chain in the
// PositionManager core module. USDC deposited into the UCD Peg Stability Module is held on Ethereum.
const POSITION_MANAGER = '0x12A1836e56139ccaD8722B89519d84233efc224B'
const PSM = '0xfE0C14B4E614f40Bf58845b4B04CeD17fd116532'

const PAGE_SIZE = 200
// LoanStatus enum: LIQUIDATED = 5. A liquidated vault no longer holds loan collateral.
const LIQUIDATED = 5

const abi = {
  core: 'address:core',
  getTotalPositions: 'uint256:getTotalPositions',
  getPositionIds: 'function getPositionIds(uint256 offset, uint256 limit) view returns (bytes32[])',
  getPositionStatus: 'function getPositionStatus(bytes32 positionId) view returns (uint8)',
  getVaultAddress: 'function getVaultAddress(bytes32 positionId) view returns (string)',
}

async function getVaultAddresses() {
  const api = new sdk.ChainApi({ chain: 'ethereum' })
  const core = await api.call({ target: POSITION_MANAGER, abi: abi.core })
  const total = Number(await api.call({ target: core, abi: abi.getTotalPositions }))

  const ids = []
  for (let offset = 0; offset < total; offset += PAGE_SIZE)
    ids.push(...await api.call({ target: core, abi: abi.getPositionIds, params: [offset, PAGE_SIZE] }))

  const statuses = await api.multiCall({ target: core, abi: abi.getPositionStatus, calls: ids })
  const openIds = ids.filter((_, i) => Number(statuses[i]) !== LIQUIDATED)
  return api.multiCall({ target: core, abi: abi.getVaultAddress, calls: openIds })
}

async function bitcoinTvl() {
  return sumTokens({ owners: await getVaultAddresses() })
}

async function ethereumTvl(api) {
  return api.sumTokens({ owner: PSM, tokens: [ADDRESSES.ethereum.USDC] })
}

module.exports = {
  timetravel: false,
  methodology: 'BTC TVL is the balance of the native Bitcoin vault of every position that has not been liquidated, including positions still pending deposit, with vault addresses read from the Diamond Hands PositionManager on Ethereum. Ethereum TVL is the USDC held by the UCD Peg Stability Module, most of it deposited by the protocol. Minted UCD is not counted.',
  bitcoin: { tvl: bitcoinTvl },
  ethereum: { tvl: ethereumTvl },
}

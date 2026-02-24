const axios = require('axios')
const ADDRESSES = require('../helper/coreAssets.json')

const ETH = ADDRESSES.null
const RPL = '0xd33526068d116ce69f19a9ee46f0bd304f21a51f'
const rocketNodeManager = '0xcf2d76A7499d3acB5A22ce83c027651e8d76e250'
const rocketMinipoolManager = '0xe54B8C641fd96dE5D6747f47C19964c6b824D62C'
const rocketMegapoolManager = '0xf2CCd522Ba5fFEda28fe0389963845D61F342034'

const trustedNodeManager = '0xb8e783882b11Ff4f6Cef3C501EA0f4b960152cc9'
const rocketVault = '0x3bDC69C4E5e13E52A65f5583c23EFB9636b469d6'
const ENDPOINT_BEACON = 'https://ethereum-beacon-api.publicnode.com/eth/v1/beacon/states/head/validators/'
const GWEI_TO_WEI = 1_000_000_000n

const abi = {
  getNodeCount: "function getNodeCount() view returns (uint256)",
  getNodeAddresses: "function getNodeAddresses(uint256 _offset, uint256 _limit) view returns (address[])",
  getNodeActiveMinipoolCount: "function getNodeActiveMinipoolCount(address _nodeAddress) view returns (uint256)",
  getNodeMinipoolAt: "function getNodeMinipoolAt(address _nodeAddress, uint256 _index) view returns (address)",
  getMinipoolPubkey: "function getMinipoolPubkey(address _minipoolAddress) view returns (bytes)",
  getValidatorCount: "function getValidatorCount() view returns (uint256)",
  getValidatorInfo: "function getValidatorInfo(uint256 _index) view returns (bytes pubkey, (uint32 lastAssignmentTime, uint32 lastRequestedValue, uint32 lastRequestedBond, uint32 depositValue, bool staked, bool exited, bool inQueue, bool inPrestake, bool expressUsed, bool dissolved, bool exiting, bool locked, uint64 exitBalance, uint64 lockedTime) validatorInfo, address megapool, uint32 validatorId)",
  getMemberCount: "function getMemberCount() view returns (uint256)",
  getMemberRPLBondAmount: "function getMemberRPLBondAmount(address _nodeAddress) view returns (uint256)",
  getMemberAt: "function getMemberAt(uint256 _index) view returns (address)",
}

const getMegapoolPubkeys = async (api) => {
  const validatorCount = await api.call({ target: rocketMegapoolManager, abi: abi.getValidatorCount })
  const calls = Array.from({ length: Number(validatorCount) }, (_, i) => ({ target: rocketMegapoolManager, params: [i] }))
  const validators = await api.multiCall({ calls, abi: abi.getValidatorInfo })
  const staked = validators.filter(v => v.validatorInfo.staked && !v.validatorInfo.exited)
  const pendingValue = validators
    .filter(v => (v.validatorInfo.inPrestake || v.validatorInfo.inQueue) && !v.validatorInfo.exited)
    .reduce((sum, v) => sum + BigInt(v.validatorInfo.lastRequestedValue), 0n)
  return {
    megapoolPubkeys: [...new Set(staked.map(v => v.pubkey).filter(Boolean))],
    pendingValue,
  }
}

const getActiveMinipoolAddresses = async (api, nodeAddresses, batchSize = 100) => {
  const allMinipools = new Set()

  for (let i = 0; i < nodeAddresses.length; i += batchSize) {
    const batch = nodeAddresses.slice(i, i + batchSize)
    const minipoolCounts = await api.multiCall({ calls: batch, target: rocketMinipoolManager, abi: abi.getNodeActiveMinipoolCount })

    const calls = batch.flatMap((addr, idx) =>
      Array.from({ length: Number(minipoolCounts[idx]) }, (_, j) => ({ target: rocketMinipoolManager, params: [addr, j] }))
    )

    if (!calls.length) continue
    const minipoolAddresses = await api.multiCall({ calls, abi: abi.getNodeMinipoolAt })
    minipoolAddresses.forEach(addr => allMinipools.add(addr))
  }

  return [...allMinipools]
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function fetchBeaconValidator(pubkey) {
  const res = await axios.get(`${ENDPOINT_BEACON}${pubkey}`)
  return res?.data?.data
}

async function asyncPool(limit, arr, iteratorFn) {
  const out = []
  for (let i = 0; i < arr.length; i += limit) {
    const chunk = arr.slice(i, i + limit)
    out.push(...await Promise.all(chunk.map(iteratorFn)))
  }
  return out
}

const tvl = async (api) => {
  const nodeCount = await api.call({ target: rocketNodeManager, abi: abi.getNodeCount })
  const nodeAddresses = await api.call({ target: rocketNodeManager, abi: abi.getNodeAddresses, params: [0, nodeCount] })

  const minipoolAddresses = await getActiveMinipoolAddresses(api, nodeAddresses)
  const { megapoolPubkeys, pendingValue } = await getMegapoolPubkeys(api)

  const minipoolPubKeys = await api.multiCall({ target: rocketMinipoolManager, calls: minipoolAddresses, abi: abi.getMinipoolPubkey })

  const pubkeys = [...new Set(minipoolPubKeys.filter(Boolean))]
  const allPubkeys = [...new Set([...pubkeys, ...megapoolPubkeys])]

  const results = await asyncPool(10, allPubkeys, async (pubkey) => {
    await sleep(80)
    try {
      const value = await fetchBeaconValidator(pubkey)
      if (!value?.balance) return 0n
      return BigInt(value.balance) * GWEI_TO_WEI
    } catch (e) {
      return 0n
    }
  })

  let totalWei = 0n
  for (const wei of results) totalWei += wei

  await api.add(ETH, totalWei)
  api.add(ETH, pendingValue * 10n ** 15n)
}

const staking = async (api) => {
  const trustedNodes = await api.fetchList({ target: trustedNodeManager, lengthAbi: abi.getMemberCount, itemAbi: abi.getMemberAt  })
  api.add(RPL, await api.multiCall({ calls: trustedNodes.map((node) => ({ target: trustedNodeManager, params: [node] })), abi: abi.getMemberRPLBondAmount }))
  return api.sumTokens({ owner: rocketVault, tokens: [RPL] })
}

module.exports = {
  methodology: 'TVL represents the total ETH from the minipools',
  ethereum: { tvl, staking }
}
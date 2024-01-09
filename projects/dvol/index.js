const sdk = require('@defillama/sdk')

const vaults = [
  '0x54781C6aa884297369A55A79eF7Fd1FD7B3bBD32',
  '0x6652f1B0531C4C75B523e74BCf5D0CD009b7BBB8'
]

const abi = {
  "existingVaultAmount": "uint256:existingVaultAmount",
  "existingVaultIds": "function existingVaultIds(uint256 index) view returns (uint256)",
  "idVaultInfoMap": "function idVaultInfoMap(uint256 id) view returns (uint256 id, address depositToken, uint256 maxVaultCapacity, uint256 minVaultLimit, uint256 saleStartTime, uint256 saleEndTime, uint256 termStartTime, uint256 termEndTime, address organization, address transferSigner)",
  "idVaultStateMap": "function idVaultStateMap(uint256 id) view returns (address lpTokenContract, uint256 soldAmount, bool hasTransferred, bool hasSettled)"
}

let vaultsTvls = {}

async function getVaultsTvl(api) {
  let key = api.chain + '_' + api.block
  if (!vaultsTvls[key])
  vaultsTvls[key] = vaultsTvlFn(api)

  return vaultsTvls[key]
}

async function vaultsTvlFn(api) {
  const borrowApi = new sdk.ChainApi({ chain: api.chain, block: api.block})
  const ownerTokens = []
  for (const target of vaults) {
    const ids = await api.fetchList({  lengthAbi: abi.existingVaultAmount, itemAbi: abi.existingVaultIds, target})
    const tokens = (await api.multiCall({  abi: abi.idVaultInfoMap, calls: ids, target })).map(i => i.depositToken)
    const soldAmounts = (await api.multiCall({  abi: abi.idVaultStateMap, calls: ids, target })).map(i => i.soldAmount)
    borrowApi.addTokens(tokens, soldAmounts)
    ownerTokens.push([tokens, target])
  }
  
  await api.sumTokens({ ownerTokens })
  const tvlBalances = api.getBalances()
  Object.entries(tvlBalances).forEach(b => borrowApi.addToken(b[0], b[1] * -1, { skipChain: true }))
  return {
    tvl: tvlBalances,
    borrowed: borrowApi.getBalances(),
  }
}

async function tvl(_, _b, _cb, { api, }) {
  return (await getVaultsTvl(api)).tvl
}

async function borrowed(_, _b, _cb, { api, }) {
  return (await getVaultsTvl(api)).borrowed
}

module.exports = {
  start: 33674950,
  timetravel: false,
  bsc: {
    tvl, borrowed,
  },
}

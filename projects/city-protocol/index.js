const CHAIN_CONFIG = {
  arbitrum: {
    registry: '0x2254d7Ee4C0312F3846d2fFF07b7CE3E666897cc',
  },
}

const vaultRecordAbi = 'function vaultRecord(address) view returns ((address,address,address,address,uint8,string,string,bool))'
const LEGACY_VAULT_TYPE = 2

async function tvl(api) {
  const { registry } = CHAIN_CONFIG[api.chain]
  const allVaults = await api.call({ target: registry, abi: 'address[]:vaults' })
  const records = await api.multiCall({ calls: allVaults, target: registry, abi: vaultRecordAbi, permitFailure: true })

  const vaults = []
  const vaultRecords = []
  const legacyVaults = []
  const legacyRecords = []

  allVaults.forEach((vault, i) => {
    const record = records[i]
    if (!record?.[7]) return

    if (+record[4] === LEGACY_VAULT_TYPE) {
      legacyVaults.push(vault)
      legacyRecords.push(record)
    } else {
      vaults.push(vault)
      vaultRecords.push(record)
    }
  })

  const [supplies, legacyAssets, legacyBalances] = await Promise.all([
    api.multiCall({ calls: vaults, abi: 'erc20:totalSupply', permitFailure: true }),
    api.multiCall({ calls: legacyVaults, abi: 'address:liquidityAssetAddr', permitFailure: true }),
    api.multiCall({ calls: legacyVaults, abi: 'uint256:totalAssets', permitFailure: true }),
  ])
  const balances = await api.multiCall({
    calls: vaults.map((vault, i) => ({ target: vault, params: [supplies[i]] })),
    abi: 'function convertToAssets(uint256) view returns (uint256)',
    permitFailure: true,
  })

  vaults.forEach((_, i) => {
    const asset = vaultRecords[i]?.[1]
    if (asset && balances[i]) api.add(asset, balances[i])
  })

  legacyVaults.forEach((_, i) => {
    if (legacyAssets[i] && legacyBalances[i]) api.add(legacyAssets[i], legacyBalances[i])
  })
}

Object.keys(CHAIN_CONFIG).forEach(chain => {
  module.exports[chain] = { tvl }
})

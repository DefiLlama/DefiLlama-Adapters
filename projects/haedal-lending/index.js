const sui = require('../helper/chain/sui')

// Haedal Lending Vault pools on Sui mainnet. TVL is the asset accounted on each VaultPool.
const VAULT_IDS = [
  '0x3770ed2af038458498d1a5eb6f4baf4a1db9711a52b8cece46d6f5659e1529fe', // USDC
  '0xcc01ba743dc27425568cf58baf122686bd2e46813ac677dac4663375969232c5', // SUI
  '0xd0caca905690acc7b11194d537b810c83e0304ab1fde7bdb5bc80f871b38259c', // haSUI
]

const splitTopLevelTypeArgs = (input) => {
  const parts = []
  let depth = 0
  let start = 0
  for (let index = 0; index < input.length; index++) {
    const char = input[index]
    if (char === '<') depth += 1
    else if (char === '>') depth -= 1
    else if (char === ',' && depth === 0) {
      parts.push(input.slice(start, index).trim())
      start = index + 1
    }
  }
  const tail = input.slice(start).trim()
  if (tail) parts.push(tail)
  return parts
}

const assetTypeFromPool = (type) => {
  const match = String(type || '').match(/::vault_pool::VaultPool<(.+)>$/)
  if (!match) return null
  const [assetType] = splitTopLevelTypeArgs(match[1])
  return assetType || null
}

const allocationEntries = (allocations) => {
  const contents = allocations?.fields?.contents || allocations?.contents
  if (!Array.isArray(contents)) throw new Error('haedal-lending: unexpected allocations layout')
  return contents
}

const allocationAccounted = (entry) => {
  const value = entry?.fields?.value?.fields || entry?.fields?.value || entry?.value || {}
  if (value.current_balance === undefined) throw new Error('haedal-lending: allocation missing current_balance')
  const balance = BigInt(value.current_balance)
  const dust = BigInt(value.dust_recorded_value || 0)
  return balance + dust
}

async function suiTVL(api) {
  const vaults = await sui.getObjects(VAULT_IDS)
  for (const [i, vault] of vaults.entries()) {
    const assetType = assetTypeFromPool(vault?.type)
    if (!assetType) throw new Error(`haedal-lending: unexpected vault ${VAULT_IDS[i]} type ${vault?.type}`)
    const total = allocationEntries(vault?.fields?.allocations).reduce(
      (sum, entry) => sum + allocationAccounted(entry),
      0n,
    )
    if (total > 0n) api.add(assetType, total.toString())
  }
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology: 'TVL is the sum of current_balance and dust_recorded_value across every allocation on each Haedal Lending VaultPool, denominated in that vault\'s asset. Assets deployed into other Sui lending protocols and Cetus vaults are included and marked double-counted.',
  sui: {
    tvl: suiTVL,
  },
}

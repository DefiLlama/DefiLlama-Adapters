'use strict'

const ASSET = 'address:asset'
const TOTAL_ASSETS = 'uint256:totalAssets'

function assertAddress(value, label) {
  if (!value || !/^0x[a-fA-F0-9]{40}$/.test(value))
    throw new Error(`Multipli: invalid ${label}: ${value}`)
}

function sameAddress(a, b) {
  return a.toLowerCase() === b.toLowerCase()
}

function validateVaultRegistry(chain, vaults) {
  const seen = new Set()
  for (const vault of vaults || []) {
    if (!vault.id) throw new Error(`Multipli: ${chain} vault is missing id`)
    assertAddress(vault.address, `${vault.id}.address`)
    assertAddress(vault.expectedAsset, `${vault.id}.expectedAsset`)
    const key = vault.address.toLowerCase()
    if (seen.has(key)) throw new Error(`Multipli: duplicate vault ${vault.address}`)
    seen.add(key)
  }
}

async function addV2(api, config) {
  const vaults = config.v2Vaults || []
  if (!vaults.length) return

  validateVaultRegistry(api.chain, vaults)
  const blocked = new Set(
    (config.blockedAssets || []).map(address => {
      assertAddress(address, `${api.chain}.blockedAsset`)
      return address.toLowerCase()
    })
  )

  const [assets, totals] = await Promise.all([
    api.multiCall({
      abi: ASSET,
      calls: vaults.map(vault => vault.address),
    }),
    api.multiCall({
      abi: TOTAL_ASSETS,
      calls: vaults.map(vault => vault.address),
    }),
  ])

  if (assets.length !== vaults.length || totals.length !== vaults.length)
    throw new Error(`Multipli: incomplete ${api.chain} V2 multicall response`)

  vaults.forEach((vault, index) => {
    const asset = assets[index]
    const amount = totals[index]
    assertAddress(asset, `${vault.id}.asset()`)

    if (!sameAddress(asset, vault.expectedAsset))
      throw new Error(
        `Multipli: ${vault.id} asset mismatch: ${asset} != ${vault.expectedAsset}`
      )
    if (blocked.has(asset.toLowerCase()))
      throw new Error(`Multipli: ${vault.id} uses blocked asset ${asset}`)
    if (amount === null || amount === undefined || !/^\d+$/.test(amount.toString()))
      throw new Error(`Multipli: ${vault.id} returned invalid totalAssets`)

    api.add(asset, amount.toString())
  })
}

async function addV1(api, config, getLegacyBalances) {
  const v1 = config.v1
  if (!v1 || !v1.enabled) return
  if (!v1.disjointFromV2)
    throw new Error(`Multipli: ${api.chain} V1/V2 disjointness not asserted`)

  const balances = await getLegacyBalances(api.chain, v1, config.blockedAssets)
  api.addBalances(balances)
}

async function calculateTvl(api, config, getLegacyBalances) {
  await addV2(api, config)
  await addV1(api, config, getLegacyBalances)
  return api.getBalances ? api.getBalances() : undefined
}

module.exports = { addV1, addV2, calculateTvl, sameAddress }

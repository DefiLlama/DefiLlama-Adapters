/**
 * @typedef {import("./core").Address} Address
 * @typedef {import("./core").NumString} NumString
 * 
 * @typedef {Object} Vault
 * @property {Address} vault
 * @property {Address} base
 * @property {Address} quote
 * @property {Address} kandel
 */

const { default: BigNumber } = require("bignumber.js");
const { cachedGraphQuery } = require("../helper/cache");
const { vaultAbi } = require("./abi");

/**
 * 
 * @param {number} chainId 
 * @returns {string}
 */
const query = (chainId) => `
query DefiLlama {
	mangroveVaults (where:{chainId:${chainId}}) {
    items {
      address
      baseAddress
      quoteAddress
      kandelAddress
    }
  }
}
`

/**
 * 
 * @param {import("@defillama/sdk").ChainApi} api 
 * @param {import("./config").ChainConfig} configEntry 
 * @returns {Promise<Vault[]>}
 * 
 * @dev This external API call is just to fetch all active vaults
 * @dev All TVL is then fetched from the chain directly
 */
async function getVaults(api, configEntry) {
  const vaults = await cachedGraphQuery(`oxium-vaults-${configEntry.chainId}`, configEntry.api_url, query(configEntry.chainId))
  return vaults.mangroveVaults.items.map(vault => ({
    vault: vault.address,
    base: vault.baseAddress,
    quote: vault.quoteAddress,
    kandel: vault.kandelAddress,
  }))
}

/**
 * 
 * @param {import("@defillama/sdk").ChainApi} api 
 * @param {Vault[]} vaults 
 * @param {Map<Address, Map<Address, BigNumber>>} map 
 * @returns {Promise<void>}
 */
async function getVaultsTokenBalancesSingleBatch(api, vaults, map) {
  const result = await api.multiCall({
    abi: vaultAbi.getUnderlyingBalances,
    calls: vaults.map(vault => vault.vault),
  })
  for (let i = 0; i < result.length; i++) {
    const vault = vaults[i]
    /** @type {NumString} */
    const baseBalance = result[i][0]
    /** @type {NumString} */
    const quoteBalance = result[i][1]
    
    if (!map.has(vault.base)) map.set(vault.base, new Map())
    map.get(vault.base).set(vault.kandel, BigNumber(baseBalance))
    if (!map.has(vault.quote)) map.set(vault.quote, new Map())
    map.get(vault.quote).set(vault.kandel, BigNumber(quoteBalance))
  }
}

/**
 * 
 * @param {import("@defillama/sdk").ChainApi} api 
 * @param {Vault[]} vaults 
 * @returns {Promise<Map<Address, Map<Address, BigNumber>>>}
 */
async function getVaultsTokenBalances(api, vaults, batchSize = 50) {
  /** @type {Map<Address, Map<Address, BigNumber>>} */
  const balances = new Map()
  for (let i = 0; i < vaults.length; i += batchSize) {
    await getVaultsTokenBalancesSingleBatch(api, vaults.slice(i, i + batchSize), balances)
  }
  return balances
}

module.exports = {
  getVaults,
  getVaultsTokenBalances,
}
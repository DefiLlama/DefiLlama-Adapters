const oxiumConfig = require("./config");
const { getOpenMarkets, getMakersPerMarket } = require("./core");
const { getVaults, getVaultsTokenBalances } = require("./vault");

/**
 * 
 * @param {import("@defillama/sdk").ChainApi} api 
 * @param {import("./config").ChainConfig} configEntry 
 * @returns {Promise<Map<Address, Map<Address, BigNumber>>>}
 * 
 * @dev result is mapping(token => mapping(maker => amount))
 */
async function getBookTvl(api, configEntry) {
  const markets = await getOpenMarkets(api, configEntry)
  return getMakersPerMarket(api, configEntry, markets)
}

/**
 * 
 * @param {import("@defillama/sdk").ChainApi} api 
 * @param {import("./config").ChainConfig} configEntry 
 * @returns {Promise<Map<Address, Map<Address, BigNumber>>>}
 * 
 * @dev result is mapping(token => mapping(vault => amount))
 */
async function getVaultTvl(api, configEntry) {
  const vaults = await getVaults(api, configEntry)
  const balances = await getVaultsTokenBalances(api, vaults)
  return balances
}

/**
 * 
 * @param {import("@defillama/sdk").ChainApi} api 
 * @param {import("./config").ChainConfig} configEntry 
 */
async function getTvl(api, configEntry) {
  const [bookTvl, vaultTvl] = await Promise.all([
    getBookTvl(api, configEntry),
    getVaultTvl(api, configEntry)
  ])

  for (const [token, makers] of bookTvl) {
    for (const [maker, amount] of makers) {
      if (vaultTvl.has(token) && vaultTvl.get(token).has(maker)) {
        // If this is a vault, do not add the promised volume
        continue;
      }
      api.addToken(token, amount)
    }
  }

  for (const [token, vaults] of vaultTvl) {
    for (const [_, amount] of vaults) {
      api.addToken(token, amount)
    }
  }
}

module.exports = {
  sei: {
    tvl: (api) => getTvl(api, oxiumConfig.sei)
  },
  misrepresentedTokens: false,
  methodology: "TVL is the total value promised on oxium markets in addition to all non promised value that are in the ALM vaults.",
  start: "2025-04-25",
}








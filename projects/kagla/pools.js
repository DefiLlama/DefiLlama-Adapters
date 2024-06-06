const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const addressProviderABI = require("./abi/addressProvider.json");
const registryABI = require("./abi/registry.json");
const { ADDRESS_PROVIDER_ADDRESS, } = require("./addresses");

const getBalances = async (api) => {
  const registry = await api.call({ target: ADDRESS_PROVIDER_ADDRESS, abi: addressProviderABI["get_registry"], })
  const poolAddresses = await api.fetchList({ lengthAbi: registryABI["pool_count"], itemAbi: registryABI["pool_list"], target: registry })

  const poolCoinsArray = await api.multiCall({ target: registry, calls: poolAddresses, abi: registryABI["get_coins"], })
  const ownerTokens = poolCoinsArray.map((v, i) => [v.filter(i => i !== nullAddress), poolAddresses[i]])
  return sumTokens2({ api, ownerTokens, blacklistedTokens: poolAddresses })
}

module.exports = {
  getBalances
}

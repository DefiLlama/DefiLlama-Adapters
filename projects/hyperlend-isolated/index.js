const ADDRESSES = require('../helper/coreAssets.json')
const abi = require("./abi.json");
const { sumTokens2 } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk');

const REGISTRY_ADDR_HYPERLIQUID = "0xf55AF86c9EC3a7d5fa6367c00a120E6B262f718d"

const registry_config = {
  hyperliquid: REGISTRY_ADDR_HYPERLIQUID,
}

async function tvl(api) {
  const pairs = await api.call({ target: registry_config[api.chain], abi: abi['getAllPairAddresses'], chain: api.chain})
  const assets = await api.multiCall({ abi: abi.asset, calls: pairs })
  const collaterals = await api.multiCall({ abi: abi.collateralContract, calls: pairs })
  let tokensAndOwners = assets.map((v, i) => [v, pairs[i]])
  tokensAndOwners = tokensAndOwners.concat(collaterals.map((v, i) => [v, pairs[i]]))
  return sumTokens2({ api, tokensAndOwners: tokensAndOwners })
}
async function borrowed(api) {
  const pairs = await api.call({ target: registry_config[api.chain], abi: abi['getAllPairAddresses'], chain: api.chain})
  const assets = await api.multiCall({ abi: abi.asset, calls: pairs })
  const bals = await api.multiCall({ abi: 'function totalBorrow() view returns (uint128 amount, uint128 shares)', calls: pairs })
  bals.forEach((bal, i) => api.add(assets[i], bal.amount))
}

module.exports = {
  methodology: 'Gets the pairs from the REGISTRY_ADDRESS and adds the asset and collateral amounts from each pair',
  hyperliquid: {
    tvl, borrowed
  },
}
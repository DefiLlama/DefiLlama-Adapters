const ADDRESSES = require('../helper/coreAssets.json')
const abi = require("./abi.json");
const { sumTokens2 } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk');

const REGISTRY_ADDR_HYPERLIQUID = "0x5aB54F5Ca61ab60E81079c95280AF1Ee864EA3e7"

const registry_config = {
  hyperliquid: REGISTRY_ADDR_HYPERLIQUID,
}

const usdxl_config = {
  hyperliquid: "0xca79db4B49f608eF54a5CB813FbEd3a6387bC645"
}

async function tvl(api) {
  const pairs = await api.call({ target: registry_config[api.chain], abi: abi['getAllPairAddresses'], chain: api.chain})
  const tokens = await api.multiCall({ abi: abi.collateralContract, calls: pairs })
  return sumTokens2({ api, tokensAndOwners: tokens.map((v, i) => [v, pairs[i]]) })
}
async function borrowed(api) {
  const pairs = await api.call({ target: registry_config[api.chain], abi: abi['getAllPairAddresses'], chain: api.chain})
  const bals = await api.multiCall({ abi: 'function totalBorrow() view returns (uint128 amount, uint128 shares)', calls: pairs })
  bals.forEach(bal => api.add(usdxl_config[api.chain], bal.amount))
}

module.exports = {
  methodology: 'Gets the pairs from the REGISTRY_ADDRESS and adds the collateral amounts from each pair',
  hyperliquid: {
    tvl, borrowed
  },
}
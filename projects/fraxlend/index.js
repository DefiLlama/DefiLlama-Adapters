const ADDRESSES = require('../helper/coreAssets.json')
const abi = require("./abi.json");
const { sumTokens2 } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk');

const REGISTRY_ADDR_ETHEREUM = "0xD6E9D27C75Afd88ad24Cd5EdccdC76fd2fc3A751"
const REGISTRY_ADDR_FRAXTAL = "0x8c22EBc8f9B96cEac97EA21c53F3B27ef2F45e57";
const REGISTRY_ADDR_ARBITRUM = "0x0bD2fFBcB0A17De2d5a543ec2D47C772eeaD316d"

const registry_config = {
  fraxtal: REGISTRY_ADDR_FRAXTAL,
  ethereum: REGISTRY_ADDR_ETHEREUM,
  arbitrum: REGISTRY_ADDR_ARBITRUM
}

const frax_config = {
  ethereum: ADDRESSES.ethereum.FRAX,
  fraxtal: "0xFc00000000000000000000000000000000000001",
  arbitrum: "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F"
}

async function tvl(api) {
  const pairs = await api.call({ target: registry_config[api.chain], abi: abi['getAllPairAddresses'], chain: api.chain})
  const tokens = await api.multiCall({ abi: abi.collateralContract, calls: pairs })
  return sumTokens2({ api, tokensAndOwners: tokens.map((v, i) => [v, pairs[i]]) })
}
async function borrowed(api) {
  const pairs = await api.call({ target: registry_config[api.chain], abi: abi['getAllPairAddresses'], chain: api.chain})
  const bals = await api.multiCall({ abi: 'function totalBorrow() view returns (uint128 amount, uint128 shares)', calls: pairs })
  bals.forEach(bal => api.add(frax_config[api.chain], bal.amount))
}

module.exports = {
  methodology: 'Gets the pairs from the REGISTRY_ADDRESS and adds the collateral amounts from each pair',
  ethereum: {
    tvl, borrowed,
  },
  fraxtal: {
    tvl, borrowed
  },
  arbitrum: {
    tvl, borrowed
  }
}
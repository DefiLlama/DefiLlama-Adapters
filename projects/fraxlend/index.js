const abi = require("./abi.json");
const { sumTokens2 } = require('../helper/unwrapLPs')

const REGISTRY_ADDR = "0xD6E9D27C75Afd88ad24Cd5EdccdC76fd2fc3A751"

async function tvl(timestamp, block, chainBlocks, { api }) {
  const pairs = await api.call({ target: REGISTRY_ADDR, abi: abi['getAllPairAddresses'], })
  const tokens = await api.multiCall({ abi: abi.collateralContract, calls: pairs })
  return sumTokens2({ api, tokensAndOwners: tokens.map((v, i) => [v, pairs[i]]) })
}

module.exports = {
  methodology: 'Gets the pairs from the REGISTRY_ADDRESS and adds the collateral amounts from each pair',
  ethereum: {
    tvl
  },
}
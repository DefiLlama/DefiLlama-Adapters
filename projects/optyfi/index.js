const sdk = require("@defillama/sdk");
const axios = require("axios");

const optyfi_api = "https://api.opty.fi";
const get_vaults_api = `${optyfi_api}/v1/yield/vaults`;
const abi = {
  totalSupply: {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  getPricePerFullShare: {
    inputs: [],
    name: "getPricePerFullShare",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
};

async function getTVL(chain, block, chain_id) {
  const vaults = (await axios.get(get_vaults_api)).data.items.filter(i => !i.is_staging && i.chain.chain_id === chain_id)
  const calls = vaults.map(i => ({ target: i.vault_token.address }))
  const { output: supply } = await sdk.api.abi.multiCall({
    abi: abi.totalSupply,
    calls, block, chain,
  })
  const { output: price } = await sdk.api.abi.multiCall({
    abi: abi.getPricePerFullShare,
    calls, block, chain,
  })
  const balances = {}
  vaults.forEach((v, i) => {
    sdk.util.sumSingleBalance(balances, chain + ':' + v.vault_underlying_token.address, supply[i].output * price[i].output / 1e18)
  })
  return balances
}

async function ethereum_tvl(timestamp, block, chainBlocks) {
  return getTVL('ethereum', block, 1)
}

async function polygon_tvl(timestamp, block, chainBlocks) {
  return getTVL('polygon', chainBlocks.polygon, 137)
}

module.exports = {
  methodology: `Users deposit into OptyFi vaults and receive vault shares. These vault shares have a price called pricePerShare. TVL is calculated as: Vault Token Supply * pricePerShare`,
  ethereum: { tvl: ethereum_tvl },
  polygon: { tvl: polygon_tvl },
};

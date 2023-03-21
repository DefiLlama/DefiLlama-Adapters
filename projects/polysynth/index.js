const sdk = require("@defillama/sdk");
const { getCache } = require('../helper/http');

let _response;
const GLP_TOKEN = "0x4277f8F2c384827B5273592FF7CeBd9f2C1ac258";
const MVLP_TOKEN = "0x9f4f8bc00f48663b7c204c96b932c29ccc43a2e8";

async function getVaults(chain) {
  if (!_response) _response = getCache('https://h.oliveapp.finance/api/rest/vaults/tvl')
  return (await _response).vault_meta_data
    .map(i => i.vault_object)
    .filter(i => i.chain_id === chains[chain])
}

function transform(address) {
  if (address.toLowerCase() === '0x5402b5f40310bded796c7d0f3ff6683f5c0cffdf') return GLP_TOKEN
  
  // change the underlying asset(sMVLP) which comes from OliveFinance api with the MVLP token 
  if (address.toLowerCase() === '0x2ee50C34392E7e7a1D17B0A42328a8D1Ad6894e3') return MVLP_TOKEN 
  return address
}

const chains = {
  ethereum: '1',
  polygon: '137',
  arbitrum: '42161'
}

module.exports = {
};

Object.keys(chains).forEach(chain => {
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const balances = {}
      const vaults = await getVaults(chain)
      const calls = vaults.map(i => i.id)
      const bals = await api.multiCall({  abi: 'uint256:totalBalance', calls })
      bals.forEach((vaule, i) => sdk.util.sumSingleBalance(balances,transform(vaults[i].underlying_asset),vaule, chain))
      return balances
    }
  }
})
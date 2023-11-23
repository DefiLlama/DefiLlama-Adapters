const ADDRESSES = require('../helper/coreAssets.json')
async function tvl(_, _b, _cb, { api, }) {

  const VAULT_CONTRACT_ADDRESS = '0x7A5df878e195D09F1C0bbba702Cfdf0ac9d0a835'
  return api.sumTokens({ owner: VAULT_CONTRACT_ADDRESS, tokens: [
    ADDRESSES.arbitrum.WETH,
    ADDRESSES.arbitrum.USDC,
    '0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F',
    ADDRESSES.arbitrum.USDC_CIRCLE
  ] })
}

module.exports = {
  arbitrum: { tvl },
}
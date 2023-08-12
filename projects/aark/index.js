const ADDRESSES = require('../helper/coreAssets.json')
async function tvl(_, _b, _cb, { api, }) {

  const VAULT_CONTRACT_ADDRESS = '0x7A5df878e195D09F1C0bbba702Cfdf0ac9d0a835'
  return api.sumTokens({ owner: VAULT_CONTRACT_ADDRESS, tokens: [
    ADDRESSES.arbitrum.WETH,
    ADDRESSES.arbitrum.USDC,
  ] })
}

module.exports = {
  arbitrum: { tvl },
}
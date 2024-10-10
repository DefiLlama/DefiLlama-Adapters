const http = require("../helper/http");

const INFINEX_API_BASE_URL = "https://api.app.infinex.xyz"

async function getAccountAddresses() {
  return http.get(`${INFINEX_API_BASE_URL}/public/accounts`);
}

async function getChainAssets(chain) {
  const assetsJson = await http.get(`${INFINEX_API_BASE_URL}/public/chainAssets`);

  return assetsJson
    .filter(i => i.chain === chain && i.address !== 'native')
    .map(v => v.address);
}

module.exports = {
  getAccountAddresses,
  getChainAssets
}

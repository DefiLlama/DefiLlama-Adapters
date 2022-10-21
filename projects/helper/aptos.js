
const http = require('./http')
const { fixBalancesTokens } = require('./tokenMapping')
const coreTokens = Object.keys(fixBalancesTokens.aptos)

const endpoint = process.env.APTOS_RPC || "https://fullnode.mainnet.aptoslabs.com"

async function aQuery(api){
  return http.get(`${endpoint}${api}`)
}
async function getResources(account){
  return http.get(`${endpoint}/v1/accounts/${account}/resources`)
}
async function getCoinInfo(address) {
  if (address === '0x1') return { data: { decimals: 8, name: 'Aptos'}}
  console.log(`${endpoint}/v1/accounts/${address}/resource/0x1::coin::CoinInfo%3C${address}::coin::T%3E`)
  return http.get(`${endpoint}/v1/accounts/${address}/resource/0x1::coin::CoinInfo%3C${address}::coin::T%3E`)
}

module.exports = {
  endpoint,
  aQuery,
  getCoinInfo,
  getResources,
  coreTokens,
};

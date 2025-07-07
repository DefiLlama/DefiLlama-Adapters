const axios = require('axios')

const CONFIG = {
  ethereum: 'getTVLEthereum',
  ontology: 'getTVLOntology',
  neo: 'getTVLNeo',
  carbon: 'getTVLCarbon',
  bsc: 'getTVLBNBChain',
  heco: 'getTVLHeco',
  okexchain: 'getTVLOKC',
  neo3: 'getTVLNeo3',
  polygon: 'getTVLPolygon',
  arbitrum: 'getTVLArbitrum',
  xdai: 'getTVLGnosisChain',
  zilliqa: 'getTVLZilliqa',
  avax: 'getTVLAvalanche',
  fantom: 'getTVLFantom',
  optimism: 'getTVLOptimistic',
  metis: 'getTVLAndromeda',
  boba: 'getTVLBoba',
  oasis: 'getTVLOasis',
  harmony: 'getTVLHarmony',
  hoo: async () => 0,
  bytomsidechain: 'getTVLBytomSidechain',
  kcc: 'getTVLKCC',
  kava: 'getTVLKava',
  starcoin: 'getTVLStarcoin',
  celo: 'getTVLCelo',
  clv: async () => 0,
  conflux: 'GetTVLConflux',
  astar: 'GetTVLAstar',
  aptos: 'GetTVLAptos',
  bitgert: 'GetTVLBitgert',
  dexit: 'GetTVLDexit',
}

const baseURL = 'https://explorer.poly.network/api/v1/'

async function getTVL(path) {
  const url = `${baseURL}${path}`;
  const { data } = await axios.get(url)
  return Number(data)
}

const tvl = async (api) => {
  const endpoint = CONFIG[api.chain]
  if (typeof endpoint === 'function') return () => 0;
  return api.addUSDValue(await getTVL(endpoint))
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  deadFrom: '2024-09-30',
}

Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = { tvl }
})
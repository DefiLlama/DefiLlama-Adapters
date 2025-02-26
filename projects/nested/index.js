const { getConfig } = require('../helper/cache')

let data

async function getData() {
  if (!data) data = _internal()
  return data
  async function _internal() {
    return getConfig('nested', tokens_url)
  }
}

const tokens_url = 'https://api.nested.finance/tvl-tokens'
const nested = {
  'polygon': {
    'prefix': 'poly', 
    'nestReserve_contract': '0x150fb0Cfa5bF3D4023bA198C725b6DCBc1577f21'
  }, 
  'bsc': {
    'prefix': 'bsc', 
    'nestReserve_contract': '0x150fb0Cfa5bF3D4023bA198C725b6DCBc1577f21'
  }, 
  'avax': {
    'prefix': 'avax', 
    'nestReserve_contract': '0x150fb0Cfa5bF3D4023bA198C725b6DCBc1577f21'
  }, 
  'ethereum': {
    'prefix': 'eth', 
    'nestReserve_contract': '0x0535f1f43ee274123291bbab284948caed46c65d'
  }, 
  'optimism': {
    'prefix': 'opti', 
    'nestReserve_contract': '0x150fb0Cfa5bF3D4023bA198C725b6DCBc1577f21'
  }, 
  'arbitrum': {
    'prefix': 'arbi', 
    'nestReserve_contract': '0x31A2a9E625C111d98d74241C046C1117cc1D94b0'
  }, 
}
// const nestRecords_contract = '0x3Ee96E771D5E56b34245b023E8B31ffDf36dFafd'
// const graphUrl = 'https://api.nested.finance/graphql'

function chainTvl_onchain(chain) {
  return async (api) => {
    const tokens_response = await getData();
    const tokens = tokens_response
      .filter(t => t.startsWith(nested[chain]['prefix']))
      .map(t => t.substring(t.indexOf(':') + 1)).flat()
    const owner = nested[chain]['nestReserve_contract']
    return api.sumTokens({ owner, tokens })
  }
}

module.exports.methodology = 'Nested TVL consists of tokens held by NestedReserve contracts on each chain, for which we can get the address using a rest api endpoint'

Object.keys(nested).forEach(chain => {
  module.exports[chain] = { tvl: chainTvl_onchain(chain) }
})
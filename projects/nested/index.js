const sdk = require('@defillama/sdk')
const {chainExports} = require('../helper/exports')
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
  return async (timestamp, ethBlock, {[chain]: block}) => {
    const balances = {}
    const transformAddress = (addr) => `${chain}:${addr}`

    
    const tokens_response = await getData();
    const recordsTokens = tokens_response
      .filter(t => t.startsWith(nested[chain]['prefix']))
      .map(t => t.substring(t.indexOf(':') + 1))

    const reserveTokens = [...new Set(recordsTokens.flat())]
    // console.log(`${chain}: All tokens from every nested records`, reserveTokens)
    
    const tokenBalances = await sdk.api.abi.multiCall({
      calls: reserveTokens.map(t => ({
        target: t,
        params: nested[chain]['nestReserve_contract'],
      })),
      abi: 'erc20:balanceOf',
      chain,
      block,
    });
    sdk.util.sumMultiBalanceOf(balances, tokenBalances, true, transformAddress);
    
    return balances
  }
}

module.exports = chainExports(chainTvl_onchain, Object.keys(nested))
module.exports.methodology = 'Nested TVL consists of tokens held by NestedReserve contracts on each chain, for which we can get the address using a rest api endpoint'

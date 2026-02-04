const { post } = require('../helper/http')

const REST_URL = 'https://rest.initia.xyz/initia/move/v1/view/json'
const CABAL_MODULE_ADDRESS = '0x53c3f5d8e11844ba3747ebaec1b2d25051574ffbeedc69d72068395991e3ea28'
const INIT_METADATA_ADDRESS = '0x8e4733bdabcf7d4afc3d14f0dd46c9bf52fb0fce9e4b996c939e195b8bc891d9'
const USDC_INIT_LP_METADATA_ADDRESS = '0x543b35a39cfadad3da3c23249c474455d15efd2f94f849473226dee8a3c7a9e1'

function toNum(str) {
  const clean = String(str).replace(/[^\d.]/g, '');
  return parseFloat(clean);
}

async function fetchView(functionName, moduleName, args) {
  const response = await post(REST_URL, {
    address: CABAL_MODULE_ADDRESS,
    module_name: moduleName,
    function_name: functionName,
    args: args,
    typeArgs: []
  })
  return response.data
}

async function tvl(api) {
  const [initStakes, lpStakes] = await Promise.all([
    fetchView('get_real_total_stakes', 'pool_router', [`"${INIT_METADATA_ADDRESS}"`]),
    fetchView('get_real_total_stakes', 'pool_router', [`"${USDC_INIT_LP_METADATA_ADDRESS}"`])
  ])
  api.add(INIT_METADATA_ADDRESS, toNum(initStakes))
  api.add(USDC_INIT_LP_METADATA_ADDRESS, toNum(lpStakes))
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is calculated as the sum of INIT token stakes and USDC-INIT LP token stakes, each multiplied by their on-chain USD value.',
  initia: {
    tvl
  }
}
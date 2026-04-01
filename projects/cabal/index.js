const { post } = require('../helper/http')

const REST_RPC = 'https://rest.initia.xyz/initia/move/v1/view/json'
const CABAL_MODULE_ADDRESS = '0x53c3f5d8e11844ba3747ebaec1b2d25051574ffbeedc69d72068395991e3ea28'
const INIT_METADATA_ADDRESS = '0x8e4733bdabcf7d4afc3d14f0dd46c9bf52fb0fce9e4b996c939e195b8bc891d9'
const USDC_INIT_LP_METADATA_ADDRESS = '0x543b35a39cfadad3da3c23249c474455d15efd2f94f849473226dee8a3c7a9e1'
const CABAL_VAULTS = [
  '0x5Eb1A2e8218a0140151ce3445A3799d6C4433f46', // iUSD vault
  '0x69fdf919612Ef40e89e56282C6891aca41640204', // Delta Neutral vault
]

function toNum(str) {
  const clean = String(str).replace(/[^\d.]/g, '');
  return parseFloat(clean);
}

async function fetchView(functionName, moduleName, args) {
  const response = await post(REST_RPC, {
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
  methodology: 'TVL is calculated as the sum of: INIT token stakes (sxINIT vault), USDC-INIT LP token stakes (cbl LP vault) on Initia, and iUSD holdings across the Cabal iUSD and Delta Neutral INIT EVM vaults on the cabal-1 L2.',
  initia: { tvl },
  cabal: { tvl: async (api) => api.erc4626Sum2({ calls: CABAL_VAULTS }) },
}

const { post, get } = require('../helper/http')

const REST_URL = 'https://rest.initia.xyz/initia/move/v1/view/json'
const CABAL_MODULE_ADDRESS = '0x53c3f5d8e11844ba3747ebaec1b2d25051574ffbeedc69d72068395991e3ea28'
const INIT_METADATA_ADDRESS = '0x8e4733bdabcf7d4afc3d14f0dd46c9bf52fb0fce9e4b996c939e195b8bc891d9'
const USDC_INIT_LP_METADATA_ADDRESS = '0x543b35a39cfadad3da3c23249c474455d15efd2f94f849473226dee8a3c7a9e1'
const CABAL_VAULTS = [
  '0x5Eb1A2e8218a0140151ce3445A3799d6C4433f46', // iUSD vault
  '0x69fdf919612Ef40e89e56282C6891aca41640204', // Delta Neutral vault
]

// strat-1: separate MiniMove rollup hosting the xSLP vault
const STRAT_VIEW_URL = 'https://rest-strat-1.anvil.asia-northeast.initia.xyz/initia/move/v1/view/json'
const STRAT_SUPPLY_URL = 'https://rest-strat-1.anvil.asia-northeast.initia.xyz/cosmos/bank/v1beta1/supply/by_denom'
const STRAT_ADDRESS = '0x9a838c8d805e885481f594efee110d6f5b407d530866f4973955afae88941733'
const STRAT_VAULT_ADDRESS = '0xd49da8a8c29c1294b98fcb119ae3bdc1cf697ac2b42d63caed608b07941ce111'
const STRAT_X_SLP_METADATA = '0x4e11c0a219f362e4d0e1f131699aa83bee40ebc8701b424373a8517d0c9e85fb'
const STRAT_I_USD_METADATA = '0x13bab7c0ed9dd9f4609f7dee7a5f69c99e14eca507f77e088d9b429f77e47b81'

function toNum(str) {
  const clean = String(str).replace(/[^\d.]/g, '');
  return parseFloat(clean);
}

async function fetchView(endpoint, address, moduleName, functionName, args) {
  const response = await post(endpoint, {
    address,
    module_name: moduleName,
    function_name: functionName,
    args: args,
    typeArgs: []
  })
  return response.data
}

async function tvl(api) {
  const [initStakes, lpStakes] = await Promise.all([
    fetchView(REST_URL, CABAL_MODULE_ADDRESS, 'pool_router', 'get_real_total_stakes', [`"${INIT_METADATA_ADDRESS}"`]),
    fetchView(REST_URL, CABAL_MODULE_ADDRESS, 'pool_router', 'get_real_total_stakes', [`"${USDC_INIT_LP_METADATA_ADDRESS}"`])
  ])
  api.add(INIT_METADATA_ADDRESS, toNum(initStakes))
  api.add(USDC_INIT_LP_METADATA_ADDRESS, toNum(lpStakes))
}

async function xslpTvl(api) {
  const iusdArg = `"${STRAT_I_USD_METADATA}"`
  const xslpDenom = `move/${STRAT_X_SLP_METADATA.slice(2).toLowerCase()}`
  const [stratShareRatio, sharePrice, supply] = await Promise.all([
    fetchView(STRAT_VIEW_URL, STRAT_ADDRESS, 'lp', 'get_strat_share_to_xslp_ratio', [iusdArg]),
    fetchView(STRAT_VIEW_URL, STRAT_VAULT_ADDRESS, 'vault', 'get_share_price', [iusdArg]),
    get(`${STRAT_SUPPLY_URL}?denom=${xslpDenom}`),
  ])
  const rawIusdAmount = toNum(supply?.amount?.amount) * toNum(stratShareRatio) * toNum(sharePrice)
  api.add(STRAT_I_USD_METADATA, rawIusdAmount)
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is calculated as the sum of: INIT token stakes (sxINIT vault), USDC-INIT LP token stakes (cbl LP vault) on Initia, iUSD holdings across the Cabal iUSD and Delta Neutral INIT EVM vaults on the cabal-1 L2, and the xSLP predeposit vault on the strat-1 L2, converted to its underlying iUSD value (xSLP supply x strat-share ratio x share price).',
  initia: { tvl },
  cabal: { tvl: async (api) => api.erc4626Sum2({ calls: CABAL_VAULTS }) },
  strat: { tvl: xslpTvl },
}

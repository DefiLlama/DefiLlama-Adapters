const { post } = require('../helper/http')
const { ethers } = require('ethers')

const INITIA_REST_RPC = 'https://rest.initia.xyz/initia/move/v1/view/json'
const CABAL_EVM_RPC = 'https://jsonrpc-cabal-1.anvil.asia-southeast.initia.xyz'
const CABAL_MODULE_ADDRESS = '0x53c3f5d8e11844ba3747ebaec1b2d25051574ffbeedc69d72068395991e3ea28'
const INIT_METADATA_ADDRESS = '0x8e4733bdabcf7d4afc3d14f0dd46c9bf52fb0fce9e4b996c939e195b8bc891d9'
const USDC_INIT_LP_METADATA_ADDRESS = '0x543b35a39cfadad3da3c23249c474455d15efd2f94f849473226dee8a3c7a9e1'
const IUSD_VAULT_ADDRESS = '0x5Eb1A2e8218a0140151ce3445A3799d6C4433f46'
const DN_VAULT_ADDRESS = '0x69fdf919612Ef40e89e56282C6891aca41640204'

const ABI = {
  totalAssets: 'function totalAssets() view returns (uint256)',
}

const vaultInterface = new ethers.Interface([ABI.totalAssets])

function toNum(str) {
  const clean = String(str).replace(/[^\d.]/g, '');
  return parseFloat(clean);
}

async function fetchView(functionName, moduleName, args) {
  const response = await post(INITIA_REST_RPC, {
    address: CABAL_MODULE_ADDRESS,
    module_name: moduleName,
    function_name: functionName,
    args: args,
    typeArgs: []
  })
  return response.data
}

async function fetchEVMTotalAssets(vaultAddress) {
  const callData = vaultInterface.encodeFunctionData('totalAssets')
  const response = await post(CABAL_EVM_RPC, {
    jsonrpc: '2.0',
    method: 'eth_call',
    params: [{ to: vaultAddress, data: callData }, 'latest'],
    id: 1
  })
  const [totalAssets] = vaultInterface.decodeFunctionResult('totalAssets', response.result)
  // iUSD has 18 decimals, price ≈ $1
  return Number(totalAssets) / 1e18
}

async function tvl(api) {
  const [initStakes, lpStakes, iusdAssets, dnAssets] = (await Promise.allSettled([
    fetchView('get_real_total_stakes', 'pool_router', [`"${INIT_METADATA_ADDRESS}"`]),
    fetchView('get_real_total_stakes', 'pool_router', [`"${USDC_INIT_LP_METADATA_ADDRESS}"`]),
    fetchEVMTotalAssets(IUSD_VAULT_ADDRESS),
    fetchEVMTotalAssets(DN_VAULT_ADDRESS),
  ])).map(r => r.status === 'fulfilled' ? r.value : null)

  if (initStakes) api.add(INIT_METADATA_ADDRESS, toNum(initStakes))
  if (lpStakes) api.add(USDC_INIT_LP_METADATA_ADDRESS, toNum(lpStakes))
  api.addUSDValue((iusdAssets ?? 0) + (dnAssets ?? 0))
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  methodology: 'TVL is calculated as the sum of: INIT token stakes (sxINIT vault), USDC-INIT LP token stakes (cbl LP vault), and iUSD holdings across the Cabal iUSD and Delta Neutral INIT EVM vaults on the cabal-1 L2, each valued at their on-chain USD price.',
  initia: {
    tvl
  }
}
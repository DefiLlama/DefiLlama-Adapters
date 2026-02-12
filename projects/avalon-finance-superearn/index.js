const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");
const { function_view } = require("../helper/chain/aptos")

const evmConfig = {
    ethereum: {
        vaultAddress: '0xf297230fA5614545B427616148a74C888620d659',
        // USDC
        vaultStableTokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    },
}

const moveConfig = {
  move: {
    vaultAddress: '0x38a958445901773dab8977471366701b4f53ae5f72967d47da3a98a3e09e5ab8',
    // USDC
    vaultStableTokenAddress: '0x83121c9f9b0527d1f056e21a950d6bf3b9e9e2e8353d0e95ccea726713cbea39',
  },
}

const getMovementTvl = async (api, { vaultAddress, vaultStableTokenAddress }) => {
  // Avalon vault_minter module address (same as vaultAddress)
  const AVALON_MODULE_ADDRESS = vaultAddress
  const AVALON_MODULE_NAME = "vault_minter"

  // Move view function: get_pool_data() -> PoolInfoView
  // Returns pool information including minted_avalon_vault amount.
  // Note: According to ABI, this function takes NO arguments.
  const GET_POOL_DATA_FN = `${AVALON_MODULE_ADDRESS}::${AVALON_MODULE_NAME}::get_pool_data`

  // Move view function: convert_to_stable(u128) -> u128
  // Converts vault token amount (u128) to stable token value (u128).
  const CONVERT_TO_STABLE_FN = `${AVALON_MODULE_ADDRESS}::${AVALON_MODULE_NAME}::convert_to_stable`

  // 1. Fetch the pool_data for this vault.
  //    get_pool_data() takes no arguments according to the ABI.
  const poolData = await function_view({
    functionStr: GET_POOL_DATA_FN,
    args: [],
    chain: "move",
  })


  // 2. Extract the vaultTokenAmount from poolData.
  //    This is the amount of vault tokens minted, which we'll convert to stable token value.
  const vaultTokenAmount = poolData.minted_avalon_vault

  // 3. Call convert_to_stable to convert vaultTokenAmount to TVL in stable tokens.
  //    Function signature: convert_to_stable(u128) -> u128
  //    Note: u128 values are passed as strings to avoid precision loss.
  const tvl = await function_view({
    functionStr: CONVERT_TO_STABLE_FN,
    args: [vaultTokenAmount],
    chain: "move",
  })

  return tvl
}

// Methodology
module.exports = {
  methodology: `Summary all the token balance in the vault contracts`,
}


 // Movement
 Object.keys(moveConfig).forEach(chain => {
  const { vaultAddress, vaultStableTokenAddress } = moveConfig[chain]
   module.exports[chain] = {
     tvl: async (api) => {

      const tvl = await getMovementTvl(api, { vaultAddress, vaultStableTokenAddress })
      api.add(vaultStableTokenAddress, tvl)
     },
   }
 })

// EVM
Object.keys(evmConfig).forEach(chain => {
  const { vaultAddress, vaultStableTokenAddress } = evmConfig[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ owners: [vaultAddress], tokens: [ vaultStableTokenAddress] }),
  }
})

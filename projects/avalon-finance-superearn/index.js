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
  // Move view function that returns the full pool_data struct for a given vault.
  const GET_POOL_DATA_FN = "0x1::primary_fungible_store::get_pool_data"

  // Move view function signature: convert_to_stable(u128)
  // It converts the vault token amount into its stable-value amount (TVL).
  const CONVERT_TO_STABLE_FN = "0x1::primary_fungible_store::convert_to_stable"

  // 1. Fetch the pool_data for this vault.
  const poolData = await function_view({
    functionStr: GET_POOL_DATA_FN,
    args: [vaultAddress],
    chain: "move",
  })

  // 2. Use the minted_avalon_vault amount as the vaultTokenAmount input
  //    to convert_to_stable and obtain the TVL in the stable token.
  const vaultTokenAmount = poolData.minted_avalon_vault

  const tvl = await function_view({
    functionStr: CONVERT_TO_STABLE_FN,
    // convert_to_stable takes a single u128 argument (the vault token amount).
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

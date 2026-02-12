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
  const primary_fungible_asset_balance = "0x1::primary_fungible_store::balance"
  const tvl = await function_view({
    functionStr: primary_fungible_asset_balance,
    type_arguments: ["0x1::fungible_asset::Metadata"],
    args: [vaultAddress, vaultStableTokenAddress],
    chain: "move"
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

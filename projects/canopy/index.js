const { function_view } = require("../helper/chain/aptos");

const canopyCoreAddress = "b10bd32b3979c9d04272c769d9ef52afbc6edc4bf03982a9e326b96ac25e7f2d"; // Canopy Core Vaults Module

const canopyLiquidswapAddress = "5cd341a0cd4c2fb8d9e342814c00d7b388ad7579365d657ebb5b18e35c3c761b"; // Canopy Liquidswap Vaults Module
// Current Canopy Liquidswap vault addresses
const canopyLiquidswapVaultArgs = [
  {
    networkAddress: "0xaeda0e3ce6ff1c6438d6c1e866d26730a1ffe1ca6974ecf30185bdfeb53809b4",
    x_type: "0x4763c5cfde8517f48e930f7ece14806d75b98ce31b0b4eab99f49a067f5b5ef2::wrapped::USDCe",
    y_type: "0x1::aptos_coin::AptosCoin",
    bin_step_type: "0x4763c5cfde8517f48e930f7ece14806d75b98ce31b0b4eab99f49a067f5b5ef2::bin_steps::X10",
    x_fa: "0x83121c9f9b0527d1f056e21a950d6bf3b9e9e2e8353d0e95ccea726713cbea39",
    y_fa: "0xa",
  },
  {
    networkAddress: "0x64f7eed2c58fe763e67f9aadb529285231df9194442ca61625524cfe0c6c23a8",
    x_type: "0x4763c5cfde8517f48e930f7ece14806d75b98ce31b0b4eab99f49a067f5b5ef2::wrapped::USDTe",
    y_type: "0x1::aptos_coin::AptosCoin",
    bin_step_type: "0x4763c5cfde8517f48e930f7ece14806d75b98ce31b0b4eab99f49a067f5b5ef2::bin_steps::X10",
    x_fa: "0x447721a30109c662dde9c73a0c2c9c9c459fb5e5a9c92f03c50fa69737f5d08d",
    y_fa: "0xa",
  },
  {
    networkAddress: "0xdf5f6db1521a9ead03be4838a3a2756f0d1925f06cb15c31cb2c06b62f22f7f7",
    x_type: "0x4763c5cfde8517f48e930f7ece14806d75b98ce31b0b4eab99f49a067f5b5ef2::wrapped::WETHe",
    y_type: "0x1::aptos_coin::AptosCoin",
    bin_step_type: "0x4763c5cfde8517f48e930f7ece14806d75b98ce31b0b4eab99f49a067f5b5ef2::bin_steps::X10",
    x_fa: "0x908828f4fb0213d4034c3ded1630bbd904e8a3a6bf3c63270887f0b06653a376",
    y_fa: "0xa",
  },
  {
    networkAddress: "0xe6cdb48ac2b010ca63f77493eaf5b16f7f2036b8ac3bde79ce028ff83af85f4c",
    x_type: "0x4763c5cfde8517f48e930f7ece14806d75b98ce31b0b4eab99f49a067f5b5ef2::wrapped::WBTCe",
    y_type: "0x1::aptos_coin::AptosCoin",
    bin_step_type: "0x4763c5cfde8517f48e930f7ece14806d75b98ce31b0b4eab99f49a067f5b5ef2::bin_steps::X10",
    x_fa: "0xb06f29f24dde9c6daeec1f930f14a441a8d6c0fbea590725e88b340af3e1939c",
    y_fa: "0xa",
  },
]

async function getCanopyCoreVaults(address) {
  return function_view({ functionStr: `${address}::vault::vaults_view`, type_arguments: [], args: ['0', '20'], chain: 'move' })
}
async function getCanopyLiquidswapVault(vaultArgs) {
  return function_view({ 
    functionStr: `${canopyLiquidswapAddress}::vault::get_total_amounts_view`, 
    type_arguments: [vaultArgs.x_type, vaultArgs.y_type, vaultArgs.bin_step_type], 
    args: [vaultArgs.networkAddress], 
    chain: 'move' })
}

module.exports = {
  timetravel: false,
  methodology:
    "Aggregates TVL for Canopy protocol.",
  move: {
    tvl: async (api) => {
      const vaultsInfo = await getCanopyCoreVaults(canopyCoreAddress)
      for (const vault of vaultsInfo.vaults) {
        const asset = vault.asset_address
        const balance = vault.total_asset
        api.add(asset, balance);
      }

      for (const vault of canopyLiquidswapVaultArgs) {
        const vaultInfo = await getCanopyLiquidswapVault(vault)
        const assetX = vault.x_fa
        const assetY = vault.y_fa
        const balanceX = vaultInfo[0]
        const balanceY = vaultInfo[1]
        api.add(assetX, balanceX);
        api.add(assetY, balanceY);
      }
    },
  },
};
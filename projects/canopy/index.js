const ADDRESSES = require('../helper/coreAssets.json')
const { function_view } = require("../helper/chain/aptos");

const canopyCoreAddress = "b10bd32b3979c9d04272c769d9ef52afbc6edc4bf03982a9e326b96ac25e7f2d"; // Canopy Core Vaults Module

const canopyLiquidswapAddress = "968a2429f2544882a1743c51128fdf876ff03a25287d618743bde5b84a4fc00e"; // Canopy Liquidswap Vaults Module
const registryAddress = "e6ef7257c8d73c55c97507705e4aac1bcc740c648eb698db3b07895fff689f05"; // Registry for Liquidswap Vaults
const liquidswapV1Address = "4763c5cfde8517f48e930f7ece14806d75b98ce31b0b4eab99f49a067f5b5ef2"; // Liquidswap V1 Module

const moveCoinAddress = ADDRESSES.aptos.APT
const moveCoinFa = "0xa"

async function getCanopyCoreVaults(address, pageSize = 100) {
  let offset = 0;
  let allVaults = [];
  let hasMoreVaults = true;

  while (hasMoreVaults) {
    const response = await function_view({
      functionStr: `${address}::vault::vaults_view`,
      type_arguments: [],
      args: [offset.toString(), pageSize.toString()],
      chain: 'move'
    });

    if (response.vaults && response.vaults.length > 0) {
      allVaults = allVaults.concat(response.vaults);
      offset += response.vaults.length;

      // If we got fewer vaults than the page size, we've reached the end
      if (response.vaults.length < pageSize) {
        hasMoreVaults = false;
      }
    } else {
      // No more vaults or empty response
      hasMoreVaults = false;
    }
    console.log('allVaults', allVaults.length)
  }

  return { vaults: allVaults };
}
async function getCanopyLiquidswapVault(vaultArgs) {
  return function_view({
    functionStr: `${canopyLiquidswapAddress}::vault::get_total_amounts_view`,
    type_arguments: [vaultArgs.token_x_type, vaultArgs.token_y_type, vaultArgs.bin_step_type],
    args: [vaultArgs.vault_address],
    chain: 'move'
  })
}

async function getCanopyLiquidswapVaultsMetadata() {
  return function_view({
    functionStr: `${registryAddress}::vaults_registry::get_all_recognized_vaults`,
    type_arguments: [],
    args: [],
    chain: 'move'
  })
}

const wrappedCache = {}

async function getWrappedFA(coin) {
  if (coin === moveCoinAddress) return moveCoinFa;
  let result = wrappedCache[coin];
  if (!result)
    wrappedCache[coin] = function_view({
      functionStr: `${liquidswapV1Address}::wrapper::get_fa_metadata`,
      type_arguments: [coin],
      args: [],
      chain: 'move'
    });
  return (await wrappedCache[coin]).inner;
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

      const vaultsMetadata = await getCanopyLiquidswapVaultsMetadata(registryAddress);
      for (const vault of vaultsMetadata) {
        const vaultInfo = await getCanopyLiquidswapVault(vault)
        const assetX = await getWrappedFA(vault.token_x_type)
        const assetY = await getWrappedFA(vault.token_y_type)
        const balanceX = vaultInfo[0]
        const balanceY = vaultInfo[1]
        api.add(assetX, balanceX);
        api.add(assetY, balanceY);
      }
    },
  },
};
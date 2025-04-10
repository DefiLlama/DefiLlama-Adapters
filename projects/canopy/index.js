const ADDRESSES = require('../helper/coreAssets.json')
const { function_view } = require("../helper/chain/aptos");

const canopyCoreAddress = "b10bd32b3979c9d04272c769d9ef52afbc6edc4bf03982a9e326b96ac25e7f2d"; // Canopy Core Vaults Module

const canopyLiquidswapAddress = "968a2429f2544882a1743c51128fdf876ff03a25287d618743bde5b84a4fc00e"; // Canopy Liquidswap Vaults Module
const registryAddress = "e6ef7257c8d73c55c97507705e4aac1bcc740c648eb698db3b07895fff689f05"; // Registry for Liquidswap Vaults
const liquidswapV1Address = "4763c5cfde8517f48e930f7ece14806d75b98ce31b0b4eab99f49a067f5b5ef2"; // Liquidswap V1 Module

const liquidswapV0_5PeripheryAddress = "0x97529f5d2d9c0b1b6595b731e70166ea5314ab8682af04d58040898b5b07bc90";

const moveCoinAddress = ADDRESSES.aptos.APT
const moveCoinFa = "0xa"

const meridianPkg = "0xfbdb3da73efcfa742d542f152d65fc6da7b55dee864cd66475213e4be18c9d54";

async function getDualAssetBalances(pkgAddress, instanceAddresses, api) {

  for (const dualAssetInstanceAddress of instanceAddresses) {

    const base_asset_balances = await function_view({
      functionStr: `${pkgAddress}::dual_asset_base_deployer::last_recorded_base_asset_balances`,
      type_arguments: [],
      args: [dualAssetInstanceAddress],
      chain: 'move'
    });

    const baseAssets = await function_view({
      functionStr: `${pkgAddress}::dual_asset_base_deployer::base_assets`,
      type_arguments: [],
      args: [dualAssetInstanceAddress],
      chain: 'move'
    });

    api.add(baseAssets[0].inner, base_asset_balances[0]);
    api.add(baseAssets[1].inner, base_asset_balances[1]);
  }

}

async function getSingleAssetBalances(pkgAddress, instanceAddresses, api) {

  for (const singleAssetInstanceAddress of instanceAddresses) {

    const total_unclaimed_contributions = await function_view({
      functionStr: `${pkgAddress}::single_asset_base_deployer::total_unclaimed_contributions`,
      type_arguments: [],
      args: [singleAssetInstanceAddress],
      chain: 'move'
    });

    const baseAssets = await function_view({
      functionStr: `${pkgAddress}::single_asset_base_deployer::base_asset`,
      type_arguments: [],
      args: [singleAssetInstanceAddress],
      chain: 'move'
    });

    api.add(baseAssets.inner, total_unclaimed_contributions);
  }

}

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
    // console.log('allVaults', allVaults.length).
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

// This function parses the paired_coin_type string to extract token types and curve type
function parseLiquidswapLPType(lpTypeString) {
  // Extract the content between < and >
  const genericPart = lpTypeString.match(/<(.+)>/)[1];

  // Split by comma and trim to get the three parts
  const parts = genericPart.split(',').map(part => part.trim());

  return {
    token0: parts[0],
    token1: parts[1],
    curveType: parts[2]
  };
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
        const balance = vault.total_asset;
        const asset_name = vault.asset_name;

        // Handle Meridian LP tokens
        if (asset_name === "Meridian LP Token") {
          // Get the underlying assets in the pool
          const poolAssetsMetadata = await function_view({
            functionStr: `${meridianPkg}::pool::pool_assets_metadata`,
            type_arguments: [],
            args: [asset],
            chain: 'move'
          });

          // Preview what we'd get if we removed liquidity
          const removeLiquidityPreview = await function_view({
            functionStr: `${meridianPkg}::pool::preview_remove_liquidity`,
            type_arguments: [],
            args: [asset, asset, balance],
            chain: 'move'
          });

          // Add each underlying asset to the TVL
          for (let i = 0; i < poolAssetsMetadata.length; i++) {
            const assetMetadata = poolAssetsMetadata[i];
            const assetAmount = removeLiquidityPreview.withdrawn_amounts[i];
            // Get the FA (fungible asset) address if necessary
            api.add(assetMetadata.inner, assetAmount);
          }
          continue;
        }

        // Handle Liquidswap V0.5 LP tokens
        if (asset_name && asset_name.startsWith("LS05")) {
          // Get the paired coin type string
          const pairedCoinType = vault.paired_coin_type?.vec?.[0];
          if (!pairedCoinType) {
            throw new Error("Missing paired_coin_type for Liquidswap LP token");
          }

          // Parse the LP type string to extract token types and curve type
          const lpTypeInfo = parseLiquidswapLPType(pairedCoinType);
          if (!lpTypeInfo) {
            throw new Error("Failed to parse LP type info");
          }

          // console.log("LP Type Info:", lpTypeInfo);

          // Get the reserves for the LP token
          const reserves = await function_view({
            functionStr: `${liquidswapV0_5PeripheryAddress}::views::get_reserves_for_lp_coins`,
            type_arguments: [
              lpTypeInfo.token0,
              lpTypeInfo.token1,
              lpTypeInfo.curveType
            ],
            args: [balance, 5], // 5 is the LS version for V0.5
            chain: 'move'
          });

          // Extract the reserve values
          const reserve0 = reserves[0];
          const reserve1 = reserves[1];

          // Get the FA addresses for both tokens
          const token0FA = await getWrappedFA(lpTypeInfo.token0);
          const token1FA = await getWrappedFA(lpTypeInfo.token1);

          // Add the reserves to the TVL
          api.add(token0FA, reserve0);
          api.add(token1FA, reserve1);

          // console.log(`Added reserves for ${asset_name}: ${token0FA}=${reserve0}, ${token1FA}=${reserve1}`);
          continue;
        }

        // For regular assets, add them directly
        api.add(asset, balance);
      }

      // Process Canopy Liquidswap vaults
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
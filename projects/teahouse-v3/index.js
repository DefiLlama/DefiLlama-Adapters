const abi = require("./abi.js")
const starknet = require("../helper/chain/starknet");
const { getConfig } = require("../helper/cache");

// teahouse public api for vault
const teahouseVaultAPI = "https://raw.githubusercontent.com/TeahouseFinance/Vaults-for-DeFiLlama/main/vaults.json";

// get vault contract addresses from teahouse api
async function getVaultContractsAddress(chain) {
  let pairVault = [];
  let portVault = [];
  let starknetPairVault = [];
  const { vaults } = await getConfig("teahouse/v3_vault_data", teahouseVaultAPI);
  vaults.forEach((element) => {
    // permissionless vaults
    if (element.isDeFi == true && element.isActive == true) {
      if (element.chain === chain) {
        // starknet
        if (chain === 'starknet') {
          starknetPairVault.push(element.share.address);
        } else {
        // evm
          const type = element.type.toLowerCase();
          if (type === "v3pair") {
            pairVault.push(element.share.address);
          } else if (type === "v3port") {
            portVault.push(element.share.address);
          }
        }
      }
    }
  });

  return {
    pair: pairVault,
    port: portVault,
    starknetPair: starknetPairVault,
  };
}

const chains = ["optimism", "arbitrum", "polygon", "bsc", "mantle", "boba", "linea", "scroll", "starknet"];

chains.forEach((chain) => {
  module.exports[chain] = {
    tvl: async (api) => {
      const vaults = await getVaultContractsAddress(chain);

      let tokens0 = await api.multiCall({
        abi: abi.assetToken0,
        calls: vaults.pair,
      });
      let tokens1 = await api.multiCall({
        abi: abi.assetToken1,
        calls: vaults.pair,
      });
      let bals = await api.multiCall({
        abi: abi.vaultAllUnderlyingAssets,
        calls: vaults.pair,
      });
      let bals0 = bals.map(innerArray => innerArray[0]);
      let bals1 = bals.map(innerArray => innerArray[1]);
      api.addTokens(tokens0, bals0);
      api.addTokens(tokens1, bals1);

      // EVM portfolio vault
      let tokens = await api.multiCall({ abi: abi.getAssets, calls: vaults.port });
      bals = await api.multiCall({ abi: abi.getAssetsBalance, calls: vaults.port });
      let assetTypes = await Promise.all(tokens.map(
        async (tokenArr, index) =>
          await api.multiCall({
            abi: abi.assetType,
            calls: tokenArr.map(token => ({ target: vaults.port[index], params: [token] })),
          })
      ));
      tokens = tokens.flat();
      bals = bals.flat();
      assetTypes = assetTypes.flat();

      // assetType: 3-TeaVault, 4-AaveAToken, convert type 4 to underlying asset and then exclude type 3 balances
      let aTokenIndice = [];
      let excludeIndice = [];
      assetTypes.forEach((type, index) => {
        if (type === '4') {
          aTokenIndice.push(index);
        } else if (type === '3') {
          excludeIndice.push(index);
        }
      });

      const underlyings = await api.multiCall({ abi: abi.underlyingAsset, calls: aTokenIndice.map((index) => tokens[index]) });
      aTokenIndice.forEach((value, index) => (tokens[value] = underlyings[index]));
      tokens = tokens.filter((_, index) => !excludeIndice.includes(index));
      bals = bals.filter((_, index) => !excludeIndice.includes(index));
      api.addTokens(tokens, bals);

      // Starknet pair vault
      tokens0 = await starknet.multiCall({
        abi: abi.asset_token0,
        calls: vaults.starknetPair,
      });
      tokens1 = await starknet.multiCall({
        abi: abi.asset_token1,
        calls: vaults.starknetPair,
      });
      bals = await starknet.multiCall({
        abi: abi.vault_all_underlying_assets,
        calls: vaults.starknetPair,
      });
      bals0 = bals.map(innerArray => innerArray.amount['0']);
      bals1 = bals.map(innerArray => innerArray.amount['1']);
      api.addTokens(tokens0, bals0);
      api.addTokens(tokens1, bals1);

      return api.getBalances();
    },
  };
});

module.exports.misrepresentedTokens = true

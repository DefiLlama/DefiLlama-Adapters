const abi = require("./abi.js")
const starknet = require("../helper/chain/starknet");
const { getConfig } = require("../helper/cache");

// teahouse public api for vault
const teahouseVaultAPI = "https://vault-content-api.teahouse.finance/vaults";

// get vault contract addresses from teahouse api
async function getVaultContractsAddress(chain) {
  let pairVault = [];
  let portVault = [];
  let starknetPairVault = [];
  const { vaults } = await getConfig("teahouse/v3", teahouseVaultAPI);
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

      // EVM pair vault
      let tokens = await api.multiCall({
        abi: abi.assetToken1,
        calls: vaults.pair,
      });
      let bals = await api.multiCall({
        abi: abi.estimatedValueIntoken1,
        calls: vaults.pair,
      });
      api.addTokens(tokens, bals);

      // EVM portfolio vault
      tokens = await api.multiCall({ abi: abi.getAssets, calls: vaults.port });
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
      tokens = await starknet.multiCall({
        abi: abi.asset_token0,
        calls: vaults.starknetPair,
      });
      bals = await starknet.multiCall({
        abi: abi.estimated_value_in_token0,
        calls: vaults.starknetPair,
      });
      api.addTokens(tokens, bals);

      return api.getBalances();
    },
  };
});

module.exports.misrepresentedTokens = true

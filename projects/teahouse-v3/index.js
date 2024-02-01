const abi = require("./abi.json");
const { getConfig } = require("../helper/cache");

// teahouse public api for vault
const teahouseVaultAPI = "https://vault-content-api.teahouse.finance/vaults";

// get vault contract addresses from teahouse api
async function getVaultContractsAddress(chain) {
  let plAddress = [];
  const { vaults } = await getConfig("teahouse", teahouseVaultAPI);
  vaults.forEach((element) => {
    // v3 vaults
    if (element.isDeFi == true && element.isActive == true) {
      if (element.chain === chain) plAddress.push(element.share.address);
    }
  });
  return plAddress;
}

const chains = ["ethereum", "optimism", "arbitrum", 'polygon', 'boba', 'mantle'];

chains.forEach((chain) => {
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api }) => {
      const vaults = await getVaultContractsAddress(chain);
      const tokens = await api.multiCall({
        abi: abi.assetToken1,
        calls: vaults,
      });
      const bals = await api.multiCall({
        abi: abi.estimatedValueIntoken1,
        calls: vaults,
      });
      api.addTokens(tokens, bals);
      if (['boba', 'mantle'].includes(chain)) {
        const tvl = await api.getUSDValue()
        if (+tvl === 0) throw new Error('tvl is 0')
      }
      return api.getBalances();
    },
  };
});

module.exports.misrepresentedTokens = true

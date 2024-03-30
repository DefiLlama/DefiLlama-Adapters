const abi = require("./abi.json");
const { getConfig } = require("../helper/cache");

// teahouse public api for vault
const teahouseVaultAPI = "https://vault-content-api.teahouse.finance/vaults";


// get vault contract addresses from teahouse api
async function getVaultContractsAddress(chain) {
  let htAddress = [];
  const { vaults } = await getConfig("teahouse/v1", teahouseVaultAPI);
  vaults.forEach((element) => {
    // v2 vaults
    if (element.isDeFi == false && element.isActive == true) {
      if (element.chain === chain) htAddress.push(element.share.address);
    }
  });
  return htAddress;
}


const chains = ["ethereum", "optimism", "arbitrum", 'polygon','bsc'];

chains.forEach((chain) => {
  module.exports[chain] = {
    tvl: async (api) => {
      const vaults = await getVaultContractsAddress(chain);
      const tokens = await api.multiCall({
        abi: "address:asset",
        calls: vaults,
      });
      const cycleIndices = (
        await api.multiCall({ abi: abi.globalState, calls: vaults })
      ).map((i) => i.cycleIndex);
      const bals = (
        await api.multiCall({
          abi: abi.cycleState,
          calls: vaults.map((vault, i) => ({
            target: vault,
            params: cycleIndices[i] - 1,
          })),
        })
      ).map((i) => i.fundValueAfterRequests);
      api.addTokens(tokens, bals);
      if (chain === 'bsc') {
        const tvl = await api.getUSDValue()
        if (+tvl === 0) throw new Error('tvl is 0 Balances:' + JSON.stringify(api.getBalances()))
      }
      return api.getBalances();
    },
  };
});

module.exports.misrepresentedTokens = true

const abi = require("./abi.json");
const { getConfig } = require("../helper/cache");

// teahouse public api for vault
const teahouseVaultAPI = "https://vault-content-api.teahouse.finance/vaults";

// get vault contract addresses from teahouse api
async function getVaultContractsAddress(chain) {
  let pairVault = [];
  let portVault = []
  const { vaults } = await getConfig("teahouse/v3", teahouseVaultAPI);
  vaults.forEach((element) => {
    // permissionless vaults
    if (element.isDeFi == true && element.isActive == true) {
      if (element.chain === chain) {
        const type = element.type.toLowerCase();
        if (type === 'v3pair') {
          pairVault.push(element.share.address);
        } else if (type === 'v3port') {
          portVault.push(element.share.address);
        }
      }
    }
  });
  return {
    pair: pairVault,
    port: portVault
  };
}

const chains = ["ethereum", "optimism", "arbitrum", 'polygon', 'boba', 'mantle'];

chains.forEach((chain) => {
  module.exports[chain] = {
    tvl: async (api) => {
      const vaults = await getVaultContractsAddress(chain);

      let tokens = await api.multiCall({
        abi: abi.assetToken1,
        calls: vaults.pair,
      });
      let bals = await api.multiCall({
        abi: abi.estimatedValueIntoken1,
        calls: vaults.pair,
      });
      api.addTokens(tokens, bals);

      tokens = await api.multiCall({ abi: "address[]:getAssets", calls: vaults.port })
      const allTokens = [...new Set(tokens.flat())]
      const symbols = await api.multiCall({ abi: 'string:symbol', calls: allTokens })
      const sMap = Object.fromEntries(allTokens.map((address, i) => [address, symbols[i]]))
      const ownerTokens = vaults.port.map((v, i) => {
        const tokenList = tokens[i].filter(t => !sMap[t].startsWith('TEA-'))
        return [tokenList, v]
      })
      return api.sumTokens({ ownerTokens})
    },
  };
});

module.exports.misrepresentedTokens = true

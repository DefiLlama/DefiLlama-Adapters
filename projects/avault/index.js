const { getConfig } = require('../helper/cache');
const { sumUnknownTokens } = require('../helper/unknownTokens');

const url = "https://www.avault.network/media/get-vaults.json";
async function tvl(api) {
  const vaultsInfo = (await getConfig('avault', url))
  const vaults = Object.values(vaultsInfo.astar)
  const bals  = await api.multiCall({  abi: 'uint256:wantLockedTotal', calls: vaults})
  const tokens  = await api.multiCall({  abi: 'address:wantAddress', calls: vaults})
  api.add(tokens, bals)
  return sumUnknownTokens({ api, resolveLP: true, useDefaultCoreAssets: true, })
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "Avault - The Best Yield Aggregator on ASTR Network",
  astar: {
    tvl,
  },
};

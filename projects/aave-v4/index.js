const { sumTokens2 } = require("../helper/unwrapLPs");
const methodologies = require("../helper/methodologies");

const config = {
  ethereum: {
    HUBS: [
      "0xCca852Bc40e560adC3b1Cc58CA5b55638ce826c9", // Core Hub
      "0x06002e9c4412CB7814a791eA3666D905871E536A", // Plus Hub
      "0x943827DCA022D0F354a8a8c332dA1e5Eb9f9F931", // Prime Hub
    ],
  }
}

const abis = {
  getAssetUnderlyingAndDecimals: "function getAssetUnderlyingAndDecimals(uint256) view returns (address, uint8)",
  getAssetTotalOwed: "function getAssetTotalOwed(uint256) view returns (uint256)",
  getAssetCount: "uint256:getAssetCount",
};

async function getHubAssets(api) {
  const assetCounts = await api.multiCall({ abi: abis.getAssetCount, calls: config[api.chain].HUBS });
  const calls = config[api.chain].HUBS.flatMap((hub, i) =>
    Array.from({ length: assetCounts[i] }, (_, assetId) => ({ target: hub, params: [assetId] }))
  );
  const assets = await api.multiCall({ abi: abis.getAssetUnderlyingAndDecimals, calls });
  return assets.map(([underlying], i) => ({ underlying, hub: calls[i].target, assetId: calls[i].params[0] }));
}

async function tvl(api) {
  const hubAssets = await getHubAssets(api);
  return sumTokens2({ api, tokensAndOwners: hubAssets.map(({ underlying, hub }) => [underlying, hub]) });
}

async function borrowed(api) {
  const hubAssets = await getHubAssets(api);
  const owed = await api.multiCall({
    abi: abis.getAssetTotalOwed,
    calls: hubAssets.map(({ hub, assetId }) => ({ target: hub, params: [assetId] })),
  });
  owed.forEach((amount, i) => api.add(hubAssets[i].underlying, amount));
}

module.exports = { methodology: methodologies.lendingMarket, }

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl, borrowed, }
})
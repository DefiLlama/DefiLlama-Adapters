const { cachedGraphQuery } = require('../helper/cache')

// @dev: mapping of XCHF, VCHF to its Bridges
const XCHFBridge = ["0xb4272071ecadd69d933adcd19ca99fe80664fc08", "0x7bbe8F18040aF0032f4C2435E7a76db6F1E346DF"];
const VCHFBridge = ["0x79d4f0232A66c4c91b89c76362016A1707CFBF4f", "0x3b71ba73299f925a837836160c3e1fec74340403"];

async function tvl(api) {
  // @dev: register bridged token as collateral for backing and TVL
  const tokensAndOwners = [XCHFBridge, VCHFBridge];

  // @dev: query of positions from minting hubs via frankencoin graph (ponder)
  const { mintingHubV1PositionV1s: positionV1s, mintingHubV2PositionV2s: positionV2s } = await cachedGraphQuery('frankencoinPos', 'https://ponder.frankencoin.com', `{ 
    mintingHubV1PositionV1s(where: {collateralBalance_gt: "0", closed: false, denied: false}, limit: 1000) { items { position collateral } }
    mintingHubV2PositionV2s(where: {collateralBalance_gt: "0", closed: false, denied: false}, limit: 1000) { items { position collateral } }
  }`);

  const vaults = positionV1s?.items.concat(positionV2s?.items).map(i => [i.collateral, i.position]);
  vaults.forEach((i) => {
    tokensAndOwners.push(i);
  });

  return api.sumTokens({ tokensAndOwners });
}

module.exports = {
  ethereum: {
    tvl,
  },
  start: '2023-10-28',
};
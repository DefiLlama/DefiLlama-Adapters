const { sumTokens2 } = require('../helper/unwrapLPs');
const { cachedGraphQuery } = require('../helper/cache')

// @dev: mapping of XCHF to its Bridge
const XCHFBridge = ["0xb4272071ecadd69d933adcd19ca99fe80664fc08", "0x7bbe8F18040aF0032f4C2435E7a76db6F1E346DF"];

async function tvl(api) {
  const tokensAndOwners = [XCHFBridge];

  // @dev: query of positions from minting hubs via frankencoin graph (ponder)
  const { positionV1s } = await cachedGraphQuery('frankencoinV1', 'https://ponder.frankencoin.com', '{ positionV1s { items { position collateral } } }');
  const { positionV2s } = await cachedGraphQuery('frankencoinV2', 'https://ponder.frankencoin.com', '{ positionV2s { items { position collateral } } }');
  
  // @dev: mapping of positions from minting hubs
  positionV1s?.items?.forEach(i => tokensAndOwners.push([i.collateral, i.position]));
  positionV2s?.items?.forEach(i => tokensAndOwners.push([i.collateral, i.position]));

  return sumTokens2({ api, tokensAndOwners, });
}

module.exports = {
  ethereum: {
    tvl,
  },
  start: '2023-10-28',
};

const { sumTokens2 } = require('../helper/unwrapLPs');
const { stakings } = require("../helper/staking.js");
const { cachedGraphQuery } = require('../helper/cache')

// @dev: mapping of XCHF, VCHF to its Bridges
const XCHFBridge = ["0xb4272071ecadd69d933adcd19ca99fe80664fc08", "0x7bbe8F18040aF0032f4C2435E7a76db6F1E346DF"];
const VCHFBridge = ["0x79d4f0232A66c4c91b89c76362016A1707CFBF4f", "0x3b71ba73299f925a837836160c3e1fec74340403"];

// @dev: all relevant addresses across all supported chains
const ChainAddressMap = {
  ethereum: {
    frankencoin: '0xB58E61C3098d85632Df34EecfB899A1Ed80921cB',
    equity: '0x1bA26788dfDe592fec8bcB0Eaff472a42BE341B2',
    savingsV2: '0x3BF301B0e2003E75A3e86AB82bD1EFF6A9dFB2aE',
    savingsReferral: '0x27d9AD987BdE08a0d083ef7e0e4043C857A17B38',
  },
  polygon: {
    bridgedFrankencoin: '0xD4dD9e2F021BB459D5A5f6c24C12fE09c5D45553',
    bridgedSavings: '0xB519BAE359727e69990C27241Bef29b394A0ACbD',
  },
  arbitrum: {
    bridgedFrankencoin: '0xD4dD9e2F021BB459D5A5f6c24C12fE09c5D45553',
    bridgedSavings: '0xb41715e54e9f0827821A149AE8eC1aF70aa70180',
  },
  optimism: {
    bridgedFrankencoin: '0xD4dD9e2F021BB459D5A5f6c24C12fE09c5D45553',
    bridgedSavings: '0x6426324Af1b14Df3cd03b2d500529083c5ea61BC',
  },
  base: {
    bridgedFrankencoin: '0xD4dD9e2F021BB459D5A5f6c24C12fE09c5D45553',
    bridgedSavings: '0x6426324Af1b14Df3cd03b2d500529083c5ea61BC',
  },
  avalanche: {
    bridgedFrankencoin: '0xD4dD9e2F021BB459D5A5f6c24C12fE09c5D45553',
    bridgedSavings: '0x8e7c2a697751a1cE7a8DB51f01B883A27c5c8325',
  },
  gnosis: {
    bridgedFrankencoin: '0xD4dD9e2F021BB459D5A5f6c24C12fE09c5D45553',
    bridgedSavings: '0xbF594D0feD79AE56d910Cb01b5dD4f4c57B04402',
  },
  sonic: {
    bridgedFrankencoin: '0xD4dD9e2F021BB459D5A5f6c24C12fE09c5D45553',
    bridgedSavings: '0x4E104918908293cd6A93E1A9bbe06C345d751235',
  },
};


async function tvl(api) {
  // @dev: register bridged token as collateral for backing and TVL
  const tokensAndOwners = [XCHFBridge, VCHFBridge];

  // @dev: query of positions from minting hubs via frankencoin graph (ponder)
  const { mintingHubV1PositionV1s: positionV1s } = await cachedGraphQuery('frankencoinV1', 'https://ponder.frankencoin.com', '{ mintingHubV1PositionV1s { items { position collateral } } }');
  const { mintingHubV2PositionV2s: positionV2s } = await cachedGraphQuery('frankencoinV2', 'https://ponder.frankencoin.com', '{ mintingHubV2PositionV2s { items { position collateral } } }');
  
  // @dev: mapping of positions from minting hubs
  positionV1s?.items?.forEach(i => tokensAndOwners.push([i.collateral, i.position]));
  positionV2s?.items?.forEach(i => tokensAndOwners.push([i.collateral, i.position]));

  return sumTokens2({ api, tokensAndOwners, });
}

module.exports = {
  ethereum: {
    tvl,
    staking: stakings(
      [ChainAddressMap.ethereum.savingsV2, ChainAddressMap.ethereum.savingsReferral],
      ChainAddressMap.ethereum.frankencoin
    ),
  },
  polygon: {
    staking: stakings(
      [ChainAddressMap.polygon.bridgedSavings],
      ChainAddressMap.polygon.bridgedFrankencoin
    ),
  },
  arbitrum: {
    staking: stakings(
      [ChainAddressMap.arbitrum.bridgedSavings],
      ChainAddressMap.arbitrum.bridgedFrankencoin
    ),
  },
  optimism: {
    staking: stakings(
      [ChainAddressMap.optimism.bridgedSavings],
      ChainAddressMap.optimism.bridgedFrankencoin
    ),
  },
  base: {
    staking: stakings(
      [ChainAddressMap.base.bridgedSavings],
      ChainAddressMap.base.bridgedFrankencoin
    ),
  },
  avax: {
    staking: stakings(
      [ChainAddressMap.avalanche.bridgedSavings],
      ChainAddressMap.avalanche.bridgedFrankencoin
    ),
  },
  xdai: {
    staking: stakings(
      [ChainAddressMap.gnosis.bridgedSavings],
      ChainAddressMap.gnosis.bridgedFrankencoin
    ),
  },
  sonic: {
    staking: stakings(
      [ChainAddressMap.sonic.bridgedSavings],
      ChainAddressMap.sonic.bridgedFrankencoin
    ),
  },
  start: '2023-10-28',
};
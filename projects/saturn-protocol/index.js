const { sumTokensExport } = require('../helper/unwrapLPs');

const USDat = '0x23238f20b894f29041f48d88ee91131c395aaa71';
const sUSDat = '0xd166337499e176bbc38a1fbd113ab144e5bd2df7';
const M = '0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b';
const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';

module.exports = {
  methodology: 'Count backing assets are locked in contracts to issue USDat stablecoins.',
  ethereum: {
    tvl: sumTokensExport({
      owner: USDat,
      tokens: [M, USDC],
    }),
    staking: async function (api) {
      const totalAssets = await api.call({ target: sUSDat, abi: 'uint256:totalAssets' });
      api.add(USDat, totalAssets)
    },
  },
};

const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  methodology: 'Count backing assets are locked in contracts to issue USDat stablecoins.',
  ethereum: {
    tvl: sumTokensExport({
      owner: '0x23238f20b894f29041f48d88ee91131c395aaa71', // USDat
      tokens: [
        '0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b', // M stablecoin
      ],
    }),
  },
};

const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology: 'The YieldFields subgraph and the YieldFields factory contract address are used to obtain the balance held in every LP pair.',
  bsc: {
    tvl: getUniTVL({ factory: '0x0A376eE063184B444ff66a9a22AD91525285FE1C', useDefaultCoreAssets: true }),
  },
  start: 1621263282, // May-17-2021 03:54:42 PM
};

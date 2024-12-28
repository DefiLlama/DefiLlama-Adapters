const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology: 'The CryptoSwap subgraph and the CryptoSwap factory contract address are used to obtain the balance held in every LP pair.',
  bsc: {
    tvl: getUniTVL({ factory: '0x4136A450861f5CFE7E860Ce93e678Ad12158695C', useDefaultCoreAssets: true }),
  },
  start: '2022-05-02', // Mon May 02 2022 12:21:54
};

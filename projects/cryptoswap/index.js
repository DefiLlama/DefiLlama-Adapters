const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

module.exports = {
  misrepresentedTokens: true,
  methodology: 'The CryptoSwap subgraph and the CryptoSwap factory contract address are used to obtain the balance held in every LP pair.',
  bsc: {
    tvl: calculateUsdUniTvl(
      "0x4136A450861f5CFE7E860Ce93e678Ad12158695C",
      'bsc',
      "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      [
        "0xe9e7cea3dedca5984780bafc599bd69add087d56",
        "0xcC4b3EA1F25c8772D390dA1DB507832aBE4a9740"
      ],
      'wbnb'
    )
  },
  start: 1651494114, // Mon May 02 2022 12:21:54
};

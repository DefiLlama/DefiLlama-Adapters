const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

module.exports = {
  misrepresentedTokens: true,
  methodology: 'The YieldFields subgraph and the YieldFields factory contract address are used to obtain the balance held in every LP pair.',
  bsc: {
    tvl: calculateUsdUniTvl(
      "0x0A376eE063184B444ff66a9a22AD91525285FE1C",
      'bsc',
      "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      [
        "0xe9e7cea3dedca5984780bafc599bd69add087d56",
        "0x04d50c032f16a25d1449ef04d893e95bcc54d747"
      ],
      'wbnb'
    )
  },
  start: 1621263282, // May-17-2021 03:54:42 PM
};

const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

module.exports = {
  misrepresentedTokens: true,
  methodology: 'The SMBswap subgraph and the SMBswap factory contract address are used to obtain the balance held in every LP pair.',
  bsc: {
    tvl: calculateUsdUniTvl(
      "0x2Af5c23798FEc8E433E11cce4A8822d95cD90565",
      'bsc',
      "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      [
        "0xe9e7cea3dedca5984780bafc599bd69add087d56",
        "0x7a364484303B38Bce7B0ab60a20DA8F2F4370129"
      ],
      'wbnb'
    )
  },
  start: 1645285089, // Sat Feb 19 2022 15:38:09
};

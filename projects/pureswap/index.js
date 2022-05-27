const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address on bsc (0x94b4188D143b9dD6bd7083aE38A461FcC6AAd07E) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  bsc: {
    tvl: calculateUsdUniTvl(
      "0x94b4188D143b9dD6bd7083aE38A461FcC6AAd07E",
      "bsc",
      "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      [
        "0xe9e7cea3dedca5984780bafc599bd69add087d56",
        "0x481F0557FB3BB5eE461FD47F287b1ca944aD89bc",
        "0x9F882567A62a5560d147d64871776EeA72Df41D3",
      ],
      "WBNB"
    ),
  },
};

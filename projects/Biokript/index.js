const ADDRESSES = require("../helper/coreAssets.json");
const { pool2s } = require("../helper/pool2");

module.exports = {
  methodology: "Pool 2 TVL in the Biokript pools",
  bsc: {
    tvl: async () => ({}),
    pool2: pool2s(
      [
        "0x49F55Bee4e1F3b7715B206b177009Fb33E23673A",
        "0x9f735e564fB151393811eaCb29F142b5740b16c2",
      ],
      [ADDRESSES.bsc.WBNB, ADDRESSES.bsc.USDT],
      "bsc"
    ),
  },
};

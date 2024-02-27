const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES = require("../helper/coreAssets.json");

const config = {
  arbitrum: {
    ownerTokens: [
      [
        [
          ADDRESSES.null,
          ADDRESSES.arbitrum.WETH,
          "0xe50fa9b3c56ffb159cb0fca61f5c9d750e8128c8",
        ],
        "0xA2Ce28868A852f4B01903B5de07d4835feFe9086",
      ],
      [
        [
          "0x8ffdf2de812095b1d19cb146e4c004587c0a0692",
          "0x93b346b6bc2548da6a1e7d98e9a421b42541425b",
        ],
        "0x8AD15574A87e30061f24977faaA2d99bC45A3169",
      ],
    ],
  },
  polygon: {
    ownerTokens: [
      [
        [
          ADDRESSES.null,
          ADDRESSES.polygon.WMATIC_2,
          "0x6d80113e533a2C0fe82EaBD35f1875DcEA89Ea97",
        ],
        "0x82CD73E9cc96cC12569D412cC2480E4d5962AfF5",
      ],
      [
        [
          ADDRESSES.null,
          "0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4",
          "0xEA1132120ddcDDA2F119e99Fa7A27a0d036F7Ac9",
        ],
        "0x8105Fc3487F117982Eb5A5456D8639b0353242d8",
      ],
      [
        [
          ADDRESSES.null,
          ADDRESSES.polygon.DAI,
          "0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE",
        ],
        "0xdc4552609a3f673f0b72958f678d4a48d0e94ebd",
      ],
    ],
  },
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: sumTokensExport(config[chain]),
  };
});

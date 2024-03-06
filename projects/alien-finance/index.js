const { sumTokens2 } = require("../helper/unwrapLPs");

const owner = "0x50454acC07bf8fC78100619a1b68e9E8d28cE022";
const tokens = [
  "0x4300000000000000000000000000000000000003", // USDB
  "0x4300000000000000000000000000000000000004", // WETH
];

module.exports = {
  timetravel: true,
  doublecounted: false,
  blast: {
    tvl: async (_, _1, _2, { api }) => {
      return sumTokens2({ owner, tokens, api });
    },
  },
  start: 427476,
};

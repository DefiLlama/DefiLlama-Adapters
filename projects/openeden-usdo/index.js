const { sumTokensExport } = require("../helper/unwrapLPs");

const config = {
  arbitrum: {
    owners: ["0x5EaFF7af80488033Bc845709806D5Fae5291eB88"],
    tokens: [
      "0xF84D28A8D28292842dD73D1c5F99476A80b6666A", //t-bill
    ],
  },
  ethereum: {
    owners: ["0x5EaFF7af80488033Bc845709806D5Fae5291eB88"],
    tokens: ["0xdd50C053C096CB04A3e3362E2b622529EC5f2e8a"],
  },
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: sumTokensExport({ ...config[chain] }),
  };
});

module.exports.methodology =
  "Counts TBILL tokens held in the USDO system wallet on Ethereum and Arbitrum.";

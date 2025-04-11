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
    tokens: ["0xdd50C053C096CB04A3e3362E2b622529EC5f2e8a", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" ],
  },
  base: {
    owners: ["0x5EaFF7af80488033Bc845709806D5Fae5291eB88"],
    tokens: ["0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" ],
  },
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: sumTokensExport({ ...config[chain] }),
  };
});

module.exports.methodology =
  "Counts TBILL tokens and USDC held in the USDO system wallet on Ethereum and Arbitrum.";

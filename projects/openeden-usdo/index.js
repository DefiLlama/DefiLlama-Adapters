const { sumTokensExport } = require("../helper/unwrapLPs");

const config = {
  arbitrum: {
    owners: ["0x5EaFF7af80488033Bc845709806D5Fae5291eB88", "0x5E6c2AD8376A9E5E857B1d91643399E9aB65ff8c", '0xaAb4Ea02e5616787931c9E8283cb27F0211DC116'],
    tokens: [
      "0xF84D28A8D28292842dD73D1c5F99476A80b6666A", //t-bill
    ],
  },
  ethereum: {
    owners: ["0x5EaFF7af80488033Bc845709806D5Fae5291eB88", "0x5E6c2AD8376A9E5E857B1d91643399E9aB65ff8c"],
    tokens: ["0xdd50C053C096CB04A3e3362E2b622529EC5f2e8a", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", "0x7712c34205737192402172409a8F7ccef8aA2AEc"],
  },
  base: {
    owners: ["0x5EaFF7af80488033Bc845709806D5Fae5291eB88"],
    tokens: ["0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"],
  },
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: sumTokensExport({ ...config[chain] }),
  };
});

module.exports.methodology =
  "Counts TBILL, USDC, and BUIDL tokens held in the USDO system wallet on Ethereum, Arbitrum and Base.";

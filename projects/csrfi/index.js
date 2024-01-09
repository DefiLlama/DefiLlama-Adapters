const { sumTokensExport, nullAddress } = require("../helper/unwrapLPs");

const CONTRACTS = [
  "0xe73191C7D3a47E45780c76cB82AE091815F4C8F9",
  "0xbe1Be54f6251109d5fB2532b85d7eE9Cb375C43f",
  "0x33544082114fF42974B2965e057e24AC52b75871",
];

module.exports = {
  methodology: "Value of all Canto in the CSR contracts",
  canto: {
    tvl: sumTokensExport({ tokens: [nullAddress], owners: CONTRACTS}),
  },
};

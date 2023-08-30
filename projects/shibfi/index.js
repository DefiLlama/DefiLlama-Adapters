const { sumTokensExport } = require("../helper/unwrapLPs");

const native_staking_contract = "0xF04d9E9CE754c9dA855Fd6A2b84efA9d4cD293F5";

const assets = [
  "0x0000000000000000000000000000000000000000", // This is address of native token
];

module.exports = {
  shibarium: {
    tvl: sumTokensExport({ owner: native_staking_contract, tokens: assets }),
  },
};

const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const native_staking_contract = "0xF04d9E9CE754c9dA855Fd6A2b84efA9d4cD293F5";

module.exports = {
  shibarium: {
    tvl: sumTokensExport({ owner: native_staking_contract, tokens: [ADDRESSES.null] }),
  },
};

const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

const tokens = [ADDRESSES.base.USDbC]; // USDC

module.exports = {
  base: { // sum vault balances
    tvl: sumTokensExport({ owners: ['0xEA6CEC09e9C8E9a0EA9335aa11719E39fB0C3a5E'], tokens }),
  },
};

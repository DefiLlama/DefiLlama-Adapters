const {  vaults, } = require("./constants");
const { sumTokens } = require("../helper/chain/algorand");

async function tvl() {
  return sumTokens({ owners: vaults, blacklistedTokens: ['1145958888', '1145959061',] })
}

module.exports = {
  timetravel: false,
  algorand: {
    tvl,
  },
};
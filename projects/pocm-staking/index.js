const http = require("../helper/http");

async function staking() {
  return {
    'nuls': Number((await http.get("https://pocm.nuls.io/api/pocm/info")).data.totalStaking).toFixed(0)
  };
}

async function stakingBTC() {
  return {
    'btc': Number((await http.get("https://pocm.nuls.io/api/pocm/info")).data.totalStakingBTC).toFixed(8)
  };
}

module.exports = {
  doublecounted: true,
  timetravel: false,
  nuls: {
    tvl: async ()=> ({}),
    staking,
  },
  bitcoin: {
    tvl: async ()=> ({}),
    stakingBTC,
  }
};

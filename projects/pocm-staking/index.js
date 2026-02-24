const http = require("../helper/http");

async function staking() {
  const data = (await http.get("https://pocm.nuls.io/api/pocm/info")).data;
  return {
    'nuls': Number(data.totalStaking).toFixed(0),
    'bitcoin': Number(data.totalStakingBTC).toFixed(8)
  };
}

module.exports = {
  doublecounted: true,
  timetravel: false,
  nuls: {
    tvl: async ()=> ({}),
    staking,
  }
};

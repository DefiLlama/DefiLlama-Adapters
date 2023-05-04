const http = require("../helper/http");

async function staking() {
  return {
    'nuls': Number((await http.get("https://pocm.nuls.io/api/pocm/info")).data.totalStaking).toFixed(0)
  };
}

module.exports = {
  timetravel: false,
  nuls: {
    tvl: async ()=> ({}),
    staking,
  }
};

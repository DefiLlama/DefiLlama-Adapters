const http = require("./helper/http");

async function staking() {
  return { 
    'coti': Number((await http.get("https://treasury-app.coti.io/get-total")).totalCotiInPool).toFixed(0),
  };
}

module.exports = {
  timetravel: false,
  coti: {
    tvl: async ()=> ({}),
    staking,
  }
};

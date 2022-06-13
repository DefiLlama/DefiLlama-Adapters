const utils = require("../helper/utils")
const { toUSDTBalances } = require('../helper/balances')

async function fetch() {
  var endpoint ='https://www.mytrade.org/b/totalMap/list?totalItem=Total%20Liquidity&pages=0&pageSize=10';
  const response = await utils.fetchURL(endpoint);
  return toUSDTBalances(parseFloat(response?.data[0].totalValue));
}

module.exports = {
  timetravel: true,
  polygon: {
    tvl: fetch
  },
}

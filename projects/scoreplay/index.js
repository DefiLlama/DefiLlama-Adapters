const { get } = require("../helper/http");

async function tvl() {
  // var response = await get("http://192.168.68.110:3000/api/defillama/tvl");
  var response = await get("https://www.scoreplay.xyz/api/defillama/tvl");
  return { ethereum: Number(response.totalEthBalance) };
}

module.exports = {
  base: { tvl },
};

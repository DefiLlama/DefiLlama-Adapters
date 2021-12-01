const axios = require("axios");
const retry = require("./helper/retry");

async function tvl() {
  const tvlTlos = (await retry(async (bail) => axios.get(
    "https://telos.caleos.io/v2/history/get_deltas?code=eosio.token&scope=eosio.rex&table=accounts",
  ))).data.deltas.map(d => d.data.amount);

  return {
    telos: tvlTlos[0],
  };
}

module.exports = {
  tvl,
};

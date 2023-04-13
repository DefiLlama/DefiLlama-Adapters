const { get } = require('./helper/http')

async function tvl() {
  const tvlTlos = (await get(
    "https://telos.caleos.io/v2/history/get_deltas?code=eosio.token&scope=eosio.rex&table=accounts",
  )).deltas.map(d => d.data.amount);

  return {
    telos: tvlTlos[0],
  };
}

module.exports = {
  telos: { tvl },
};

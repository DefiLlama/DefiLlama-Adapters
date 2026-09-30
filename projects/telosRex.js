const { post } = require('./helper/http')

async function tvl() {
  const { rows } = await post("https://telos.greymass.com/v1/chain/get_table_rows", {
    json: true, code: "eosio.token", scope: "eosio.rex", table: "accounts",
  })
  const tlos = rows.find(r => r.balance.endsWith(' TLOS')).balance.split(' ')[0]

  return {
    telos: +tlos,
  };
}

module.exports = {
  timetravel: false,
  telos: { tvl },
};

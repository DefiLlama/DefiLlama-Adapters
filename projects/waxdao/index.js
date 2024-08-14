const { get_account_tvl } = require("../helper/chain/eos");

// WaxDAO
// https://waxdao.io
async function wax() {
  const accounts = ["waxdaofarmer", 
                    "farms.waxdao", 
                    "waxdaolocker", 
                    "waxdaomarket", 
                    "waxdaobacker",
                    "dao.waxdao", 
                    "tf.waxdao",
                    "waxdaoescrow",
                    "waxdaosynths"];
  const tokens = [
      ["eosio.token", "WAX", "wax"],
      ["wuffi", "WUF", "wuffi"],
      ["alien.worlds", "TLM", "alien-worlds"],
  ];
  return await get_account_tvl(accounts, tokens, "wax");
}

module.exports = {
  methodology: `WaxDAO TVL is achieved by querying token balances from vesting, farming, market and DAO contracts`,
  wax: {
    tvl: wax
  },
}
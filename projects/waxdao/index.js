const { get_account_tvl } = require("../helper/chain/eos");

const staking_accounts = ["waxdaofarmer", "farms.waxdao", "tf.waxdao"];

const tokens = [
    ["eosio.token", "WAX", "wax"],
    ["wuffi", "WUF", "wuffi"],
    ["alien.worlds", "TLM", "alien-worlds"],
];


// WaxDAO
// https://waxdao.io
async function wax() {
  const accounts = ["waxdaolocker", "waxdaomarket", "waxdaobacker", "waxdaoescrow", "waxdaosynths"];

  return await get_account_tvl(accounts, tokens, "wax");
}

async function staking() {
  return await get_account_tvl(staking_accounts, tokens, "wax");
}

module.exports = {
  methodology: `WaxDAO TVL is achieved by querying token balances from vesting, farming, and market contract(s)`,
  wax: {
    tvl: wax,
    staking
  },
}
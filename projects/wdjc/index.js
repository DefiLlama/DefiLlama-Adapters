const { get_account_tvl } = require("../helper/chain/eos");

// WDJC
// https://waxdeer.com
async function wax() {
  const accounts = ["faw.waxdeers"];
  const tokens = [
    ["eosio.token", "WAX", "wax"],
  ];
  return await get_account_tvl(accounts, tokens, "wax");
}

module.exports = {
  methodology: `WDJC TVL is achieved by querying token balances from game smart contract.`,
  wax: {
    tvl: wax
  },
}

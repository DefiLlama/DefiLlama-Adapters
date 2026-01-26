const { get_account_tvl } = require("../helper/chain/eos");

// WaxFun
// https://wax.fun
async function wax() {
  const accounts = ["main.waxfun"];
  const tokens = [
      ["eosio.token", "WAX", "wax"]
  ];
  return await get_account_tvl(accounts, tokens, "wax");
}

module.exports = {
  methodology: `WaxFun TVL is achieved by querying token balances from a launchpad contract`,
  wax: {
    tvl: wax
  },
}
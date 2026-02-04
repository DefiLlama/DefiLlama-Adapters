const { get_account_tvl } = require("../helper/chain/eos");

// WaxFusion
// https://waxfusion.io
async function wax() {
  const accounts = ["dapp.fusion", "pol.fusion", "cpu1.fusion", "cpu2.fusion", "cpu3.fusion"];
  const tokens = [
      ["eosio.token", "WAX", "wax"]
  ];
  return await get_account_tvl(accounts, tokens, "wax");
}

module.exports = {
  methodology: `WaxFusion TVL is achieved by querying token balances from liquid staking contracts`,
  wax: {
    tvl: wax
  },
}
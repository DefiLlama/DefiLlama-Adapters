const { get_account_tvl } = require("../helper/chain/eos");

// R-Planet
// https://rplanet.io
async function wax() {
  const accounts = ["a.rplanet", "game.rplanet", "s.rplanet"];
  const tokens = [
      ["eosio.token", "WAX", "wax"]
  ];
  return await get_account_tvl(accounts, tokens, "wax");
}

module.exports = {
  methodology: `R-Planet TVL is achieved by querying token balances from NFT Gaming contracts`,
  wax: {
    tvl: wax
  },
}
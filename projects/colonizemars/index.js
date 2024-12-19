const { get_account_tvl } = require("../helper/chain/eos");

// Colonize Mars
// https://colonizemars.com
async function wax() {
  const accounts = ["play.mars"];
  const tokens = [
      ["eosio.token", "WAX", "wax"]
  ];
  return await get_account_tvl(accounts, tokens, "wax");
}

module.exports = {
  methodology: `Colonize Mars TVL is achieved by querying token balances from NFT gaming contracts`,
  wax: {
    tvl: wax
  },
}
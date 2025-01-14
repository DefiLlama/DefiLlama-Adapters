const { get_account_tvl } = require("../helper/chain/eos");

// Taco Studios
// https://swap.tacocrypto.io
async function wax() {
  const accounts = ["swap.taco"];
  const tokens = [
      ["eosio.token", "WAX", "wax"],
      ["token.nefty", "NEFTY", "nefty"],
      ["alien.worlds", "TLM", "alien-worlds"],
      ["usdt.alcor", "USDT", "alcor-ibc-bridged-usdt-wax"],
      ["wombattokens", "WOMBAT", "wombat"],
      ["wuffi", "WUF", "wuffi"],
      ["token.fusion", "LSWAX", "waxfusion-staked-wax"],
  ];
  return await get_account_tvl(accounts, tokens, "wax");
}

module.exports = {
  methodology: `Taco Studios TVL is achieved by querying token balances from a (v2 uniswap fork) swap contract`,
  wax: {
    tvl: wax
  },
}
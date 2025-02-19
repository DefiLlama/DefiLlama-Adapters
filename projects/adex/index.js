const { get_account_tvl } = require("../helper/chain/eos");

// A-DEX
// https://a-dex.io
async function eos() {
  const accounts = ["swap.adex"];
  const tokens = [
      ["eosio.token", "EOS", "eos"],
      ["tethertether", "USDT", "tether"],
  ];
  return await get_account_tvl(accounts, tokens);
}

// A-DEX
// https://wax.a-dex.io
async function wax() {
  const accounts = ["swap.adex"];
  const tokens = [
      ["eosio.token", "WAX", "wax"],
      ["alien.worlds", "TLM", "alien-worlds"],
      ["usdt.alcor", "USDT", "usdt-alcor"],
      ["token.fusion", "LSWAX", "waxfusion-staked-wax"],
  ];
  return await get_account_tvl(accounts, tokens, "wax");
}

module.exports = {
  methodology: `A-DEX TVL is achieved by querying token balances from swap smart contract.`,
  eos: {
    tvl: eos
  },
  wax: {
    tvl: wax
  },
}

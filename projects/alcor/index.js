const { get_account_tvl } = require("../helper/chain/eos");

// Alcor
// https://eos.alcor.exchange/
async function eos() {
  const accounts = ["alcorammswap", "eostokensdex"];
  const tokens = [
      ["eosio.token", "EOS", "eos"],
      ["tethertether", "USDT", "tether"],
  ];
  return await get_account_tvl(accounts, tokens);
}

// Alcor
// https://wax.alcor.exchange
async function wax() {
  const accounts = ["alcorammswap", "alcordexmain"];
  const tokens = [
      ["eosio.token", "WAX", "wax"],
      ["alien.worlds", "TLM", "alien-worlds"],
      ["token.rfox", "TLM", "redfox-labs"],
  ];
  return await get_account_tvl(accounts, tokens, "wax");
}

module.exports = {
  methodology: `Alcor TVL is achieved by querying token balances from Swap & Limit smart contract(s).`,
  eos: {
    tvl: eos
  },
  wax: {
    tvl: wax
  },
}
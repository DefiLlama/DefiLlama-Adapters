const { get_account_tvl } = require("../helper/chain/eos");

// AtomicHub
// https://eos.atomichub.io/
async function eos() {
  const tokens = [
    ["eosio.token", "EOS", "eos"],
  ];
  return await get_account_tvl("atomicmarket", tokens);
}

// AtomicHub
// https://wax.atomichub.io/
async function wax() {
  const accounts = ["atomicmarket", "atomicassets"];
  const tokens = [
    ["eosio.token", "WAX", "wax"],
  ];
  return await get_account_tvl(accounts, tokens, "wax");
}

module.exports = {
  methodology: `AtomicHub TVL is achieved by querying token balances from AtomicHub's smart contracts.`,
  eos: {
    tvl: eos
  },
  wax: {
    tvl: wax
  },
}
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
  const tokens = [
    ["eosio.token", "WAX", "wax"],
  ];
  return await get_account_tvl("atomicmarket", tokens, "wax");
}

module.exports = {
  methodology: `AtomicHub TVL is achieved by querying token balances from AtomicHub's smart contract.`,
  eos: {
    tvl: eos
  },
  wax: {
    tvl: wax
  },
}
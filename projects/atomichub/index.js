const { get_account_tvl } = require("../helper/eos");

const tokens = [
    ["eosio.token", "EOS", "eos"],
];

// AtomicHub
// https://eos.atomichub.io/
async function eos() {
  return await get_account_tvl("atomicmarket", tokens);
}

module.exports = {
  methodology: `AtomicHub TVL is achieved by querying token balances from AtomicHub's smart contract.`,
  eos: {
    tvl: eos
  },
}
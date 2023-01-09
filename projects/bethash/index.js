const { get_account_tvl } = require("../helper/chain/eos");

const accounts = [
  "eoshashhouse",
  "eoshashstake"
]

const tokens = [
    ["eosio.token", "EOS", "eos"]
];

// BetHash
// https://bethash.io/
async function eos() {
  return await get_account_tvl(accounts, tokens);
}

module.exports = {
  methodology: `BetHash TVL is achieved by querying token balances from BetHash's smart contracts.`,
  eos: {
    tvl: eos
  },
}
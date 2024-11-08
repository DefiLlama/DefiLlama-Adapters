const { sumTokens2 } = require("../helper/solana");

async function tvl() {
  return sumTokens2({ tokenAccounts: ['Ejg5vqsthntG8wJDijzgEWvdvhoAh8pzu4Q4r4MqsdkR'] })
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology: "Bitget Staked SOL (BGSOL) is a tokenized representation on your staked sSOL",
  solana: { tvl },
};
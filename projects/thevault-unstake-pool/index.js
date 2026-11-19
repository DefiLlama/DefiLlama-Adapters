const { PublicKey } = require("@solana/web3.js");
const { getStakedSol, sumTokens2 } = require("../helper/solana")

async function tvl(api) {
  // Unstake pool: https://docs.thevault.finance/products/unstake-pool
  // Program: https://solscan.io/account/2rU1oCHtQ7WJUvy15tKtFvxdYNNSc3id7AzUcjeFSddo
  // Stake account: https://solscan.io/account/9nyw5jxhzuSs88HxKJyDCsWBZMhxj2uNXsFcyHF5KBAb#defiactivities
  // Liquid stake: https://solscan.io/account/6RLKARrt6oPCyuMCdYdUHmJxd4wUa6ZeyiC8VSMcYxRv

  await getStakedSol('9nyw5jxhzuSs88HxKJyDCsWBZMhxj2uNXsFcyHF5KBAb', api);
  await sumTokens2({
    api,
    solOwners: [new PublicKey('6RLKARrt6oPCyuMCdYdUHmJxd4wUa6ZeyiC8VSMcYxRv')]
  })
}

module.exports = {
  timetravel: false,
  solana: {
    tvl
  },
};

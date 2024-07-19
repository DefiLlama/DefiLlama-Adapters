const { sumTokens2 } = require('../helper/solana');
const ANA = "ANAxByE6G2WjFp7A4NqtWYXb3mgruyzZYg3spfxe6Lbo";
const stakingContract = "CxuuSEv67PzNkMxqCvHeDUr6HKaadoz8NhTfxbQSJnaG";

async function staking() {
  return sumTokens2({ tokensAndOwners: [[ANA, stakingContract]] });
}

async function tvl() {
  return sumTokens2({ tokenAccounts: ['EwQa93fpN2a6smD7EBFjQEyDt3DP8EMLHLjgAWxG9Qhj', '6t7ViNDULtkgvmntHsmi1QV73Tez7ZcX6DJvARHkfUJZ',] })
}

module.exports = {
  hallmarks: [
    [1659009600, "Flash-Loan & Price Manipulation Attack"]
  ],
  timetravel: false,
  methodology:
    "The total value of ANA tokens locked in the protocol, either as staking or as collateral for loans.",
  solana: {
    tvl,
    staking,
  },
  deadFrom: 1669009600,
};
const { getTokenBalance, getTokenAccountBalance, } = require('../helper/solana');
const ANA = "ANAxByE6G2WjFp7A4NqtWYXb3mgruyzZYg3spfxe6Lbo";
const stakingContract = "CxuuSEv67PzNkMxqCvHeDUr6HKaadoz8NhTfxbQSJnaG";

async function staking() {
  const balance = await getTokenBalance(ANA, stakingContract);
  return { 'nirvana-ana': balance };
}
async function tvl() {
  return { 
    'tether': await getTokenAccountBalance('EwQa93fpN2a6smD7EBFjQEyDt3DP8EMLHLjgAWxG9Qhj'),
    'usd-coin': await getTokenAccountBalance('6t7ViNDULtkgvmntHsmi1QV73Tez7ZcX6DJvARHkfUJZ'),
  };
}

module.exports = {
  hallmarks: [
    [1659009600,"Flash-Loan & Price Manipulation Attack"]
  ],
  timetravel: false,
  methodology:
    "The total value of ANA tokens locked in the protocol, either as staking or as collateral for loans.",
  solana: {
    tvl,
    staking,
  },
};
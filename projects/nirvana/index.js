const { getTokenBalance } = require('../helper/solana');
const ANA = "ANAxByE6G2WjFp7A4NqtWYXb3mgruyzZYg3spfxe6Lbo";
const stakingContract = "CxuuSEv67PzNkMxqCvHeDUr6HKaadoz8NhTfxbQSJnaG";

async function staking() {
  const balance = await getTokenBalance(ANA, stakingContract);
  return { 'nirvana-ana': balance };
};

module.exports = {
  timetravel: false,
  methodology:
    "The total value of ANA tokens locked in the protocol, either as staking or as collateral for loans.",
  solana: {
    tvl: () => ({}),
    staking,
  },
};
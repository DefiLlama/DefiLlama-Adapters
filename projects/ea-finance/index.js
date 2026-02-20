const STAKING_CONTRACT = '0x23EbC3770f98c01EDAB20eb1eF17Ee633c19b467';
const WCC_TOKEN = '0x6050D829F5a5E0eA758D8357DDcdeC1381699248';

async function staking(_, _b, _cb, { api }) {
  const contractInfo = await api.call({
    abi: 'function getContractInfo() view returns (uint256 rewardPerPeriodAmount, uint256 rewardPeriodSeconds, uint256 totalStakedAmount, uint256 totalClaimedAmount, uint256 totalFeesAmount, uint256 rewardStartTimestamp, uint256 lastRewardUpdateTimestamp, uint256 currentTime, uint256 poolCapAmount, uint256 walletCapAmount, uint256 depositFee)',
    target: STAKING_CONTRACT,
  })
  
  const totalStaked = contractInfo[2];
  
  const decimals = await api.call({
    abi: 'erc20:decimals',
    target: WCC_TOKEN,
  });
  
  const totalStakedFormatted = totalStaked / (10 ** decimals);
  
  return {
    'coingecko:canton-network': totalStakedFormatted
  }
}

module.exports = {
  timetravel: true,
  start: 1767126150,
  methodology: "TVL is calculated as the total amount of WCC tokens staked in the staking contract. WCC is a wrapped version of CC token (from Canton network) with a 1:1 peg. WCC price should track CC token price.",
  bsc: {
    tvl: staking,
    // staking: staking
  }
}
const axios = require('axios');

const HYPERLIQUID_MAINNET_RPC_URL = 'https://api.hyperliquid.xyz';

const getUserStakingSummary = async (user) => {
  const url = `${HYPERLIQUID_MAINNET_RPC_URL}/info`;

  const response = await axios.post(url, {
    type: 'delegatorSummary',
    user,
  });

  return response.data;
};

async function tvl(api) {
  const KstakingManager = '0x393D0B87Ed38fc779FD9611144aE649BA6082109';
  const HistakingManager = '0xad492f9cadccce9c3c213edd8ae55c152cd3a3ad';
  for (const stakingManager of [KstakingManager, HistakingManager]) {
    const summary = await getUserStakingSummary(stakingManager);
    api.addGasToken((+summary.delegated + +summary.undelegated - summary.totalPendingWithdrawal) * 1e18)
  }
}

module.exports = {
  timetravel: false,
  hyperliquid: { tvl }
}
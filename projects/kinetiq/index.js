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

async function tvl() {
    const stakingManager = '0x393D0B87Ed38fc779FD9611144aE649BA6082109';
    const summary = await getUserStakingSummary(stakingManager);

    return {
        "hyperliquid:0x0000000000000000000000000000000000000000": (Number(summary.delegated) + Number(summary.undelegated) - summary.totalPendingWithdrawal)*1e18
    }
}

module.exports = {
  timetravel: false,
  hyperliquid: { tvl }
}
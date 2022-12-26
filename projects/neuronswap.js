const { toUSDTBalances } = require("./helper/balances");
const { get } = require('./helper/http')

async function NRtvl() {
    const response = await get("https://core.neuronswap.com/api/dashboard")
    return toUSDTBalances(response.data.totalLp);
};

async function stakedNR() {
    const response = await get("https://core.neuronswap.com/api/dashboard")
    return toUSDTBalances(response.data.totalStakedNeuronPrice);
};

module.exports = {
    misrepresentedTokens: true,
    timetravel: false,
    methodology: `Tvl counts the tokens locked on AMM pools and staking counts the NR that has been staked. Data is pulled from the 'https://core.neuronswap.com/api/dashboard'`,
    klaytn: {
        tvl: NRtvl,
        staking: stakedNR,
    },
};
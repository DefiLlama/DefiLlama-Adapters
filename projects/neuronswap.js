const retry = require("./helper/retry");
const axios = require("axios");
const { toUSDTBalances } = require("./helper/balances");

async function NRtvl() {
    const response = await retry(
        async (bail) => await axios.get("https://core.neuronswap.com/api/dashboard")
    );
    return toUSDTBalances(response.data.data.totalLp);
};

async function stakedNR() {
    const response = await retry(
        async (bail) => await axios.get("https://core.neuronswap.com/api/dashboard")
    );
    return toUSDTBalances(response.data.data.totalStakedNeuronPrice);
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
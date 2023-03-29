const axios = require('axios');
const dataUrl = 'https://spicya.sdaotools.xyz/api/rest/SpicyDailyMetrics';

async function tvl() {
    const data = (await axios(dataUrl)).data;
    const totalLiquidity = data.spicy_day_data[0].totalliquidityxtz;
    return {
        "tezos": totalLiquidity
    }
}

module.exports = {
    methodology: `TVL counts the liquidity of SpicySwap farms. Data is pulled from:"${dataUrl}".`,
    misrepresentedTokens: true,
    timetravel: false,
    tezos: {
        tvl,
        staking: async () => {
            const data = (await axios(dataUrl)).data;
            const tether = data.spicy_day_data[0].totalstakedfarmusdspi;
            return { tether }
        },
    }
}

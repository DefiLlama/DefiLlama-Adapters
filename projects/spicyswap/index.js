const axios = require('axios');
const BigNumber = require("bignumber.js");
const dataUrl = 'https://spicyb.sdaotools.xyz/api/rest/SpicyDailyMetrics';

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
    tvl
}

const axios = require("axios");
const {toUSDTBalances} = require('../helper/balances')

const tvlUrl = 'https://kolibri-data.s3.amazonaws.com/mainnet/totals.json';

async function tvl() {
    const response = await axios.get(tvlUrl)

    const xtzInOvens = Number(response.data.totalBalance)/1000000;
    const liquidityPoolBalance = Number(response.data.liquidityPoolBalance)
    
    return {
        "tezos": xtzInOvens,
        "true-usd": liquidityPoolBalance
    }
}
async function pool2() {
    return toUSDTBalances((await axios.get(tvlUrl)).data.quipuswapFarmBalanceUSD);
}
module.exports = {
    methodology: 'TVL counts the XTZ tokens that are deposited to mint kUSD, and kUSD in the liquidity pool. Borrowed tokens are not counted.',
    tezos:{
        tvl,
        pool2
    }
};

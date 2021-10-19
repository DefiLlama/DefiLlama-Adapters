const axios = require("axios");
const {toUSDTBalances} = require('../helper/balances')

const tvlUrl = 'https://kolibri-data.s3.amazonaws.com/mainnet/totals.json';

async function tvl() {
    return toUSDTBalances((await axios.get(tvlUrl)).data.liquidityPoolBalance);
}
async function pool2() {
    return toUSDTBalances((await axios.get(tvlUrl)).data.quipuswapFarmBalanceUSD);
}
module.exports = {
    methodology: 'TVL counts the XTZ tokens that are deposited to mint kUSD, kUSD in the liquidity pool, and value locked in Kolibri Protocol\'s farms. Borrowed tokens are not counted.',
    tezos:{
        tvl,
        pool2
    }
};
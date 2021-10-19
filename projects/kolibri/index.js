const axios = require("axios");
const {toUSDTBalances} = require('../helper/balances')

const priceUrl = 'https://oracle-data.kolibri.finance/data.json';
const tvlUrl = 'https://kolibri-data.s3.amazonaws.com/mainnet/totals.json';

async function tvl() {
    const response = await axios.get(tvlUrl)

    // Balance of Liquidity Pool
    const liquidityPoolBalance = new BigNumber(response.data.liquidityPoolBalance)

    // Balance of locked XTZ, in terms of USD
    const price = new BigNumber((await axios.get(priceUrl)).data.prices.XTZ);
    const xtzInOvens = new BigNumber(response.data.totalBalance);
    const usdInOvens = xtzInOvens.multipliedBy(price).dividedBy(1000000).toFixed(0);
    
    return toUSDTBalances(usdInOvens.plus(liquidityPoolBalance))
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

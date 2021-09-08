const axios = require("axios");
const BigNumber = require("bignumber.js");

const priceUrl = 'https://oracle-data.kolibri.finance/data.json';
const tvlUrl = 'https://kolibri-data.s3.amazonaws.com/mainnet/totals.json';

async function fetch() {
    const price = new BigNumber((await axios.get(priceUrl)).data.prices.XTZ);
    const data = (await axios.get(tvlUrl)).data

    const tvl = new BigNumber(data.totalBalance);
    const ovenTvl = tvl.multipliedBy(price).dividedBy(1000000).toFixed(0);

    const liquidityPoolTvl = new BigNumber(data.liquidityPoolBalance)

    const farmsTvl = new BigNumber(data.totalFarmBalanceUSD)

    return ovenTvl.plus(liquidityPoolTvl).plus(farmsTvl)
}

module.exports = {
    methodology: 'TVL counts the XTZ tokens that are deposited to mint kUSD, borrowed tokens are not counted.',
    fetch
};
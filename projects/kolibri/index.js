const axios = require("axios");
const BigNumber = require("bignumber.js");

const priceUrl = 'https://oracle-data.kolibri.finance/data.json';
const tvlUrl = 'https://kolibri-data.s3.amazonaws.com/mainnet/totals.json';

async function fetch() {
    const price = new BigNumber((await axios.get(priceUrl)).data.prices.XTZ);
    const tvl = new BigNumber((await axios.get(tvlUrl)).data.totalBalance);
    return tvl.multipliedBy(price).dividedBy(1000000).toFixed(0);
}

module.exports = {
    methodology: 'TVL counts the XTZ tokens that are deposited to mint kUSD, borrowed tokens are not counted.',
    fetch
};
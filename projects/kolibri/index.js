const axios = require("axios");
const BigNumber = require("bignumber.js");

const tvlUrl = 'https://kolibri-data.s3.amazonaws.com/mainnet/totals.json';

async function fetch() {
    return new BigNumber((await axios.get(tvlUrl)).data.tvlUSD);
}

module.exports = {
    methodology: 'TVL counts the XTZ tokens that are deposited to mint kUSD, kUSD in the liquidity pool, and value locked in Kolibri Protocol\'s farms. Borrowed tokens are not counted.',
    fetch
};
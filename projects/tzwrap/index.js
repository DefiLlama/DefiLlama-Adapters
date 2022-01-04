const axios = require("axios");
const BigNumber = require("bignumber.js");

const tvlUrl = 'https://stats.info.tzwrap.com/v1/tvl/volume/now';

async function fetch() {
    const tvl = new BigNumber((await axios.get(tvlUrl)).data.totalUsd);
    return tvl.toFixed(0);
}

module.exports = {
    fetch
};

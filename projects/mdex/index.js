const retry = require('async-retry');
const axios = require("axios");

async function fetch(chainId) {
    return (await retry(async () => 
        await axios.get(`https://info.mdex.one/pair/tvl?chain_id=${chainId}`)
    )).data.result
    .map(p => p.tvl)
    .reduce((a, b) => a + parseFloat(b), 0);
}; 

async function heco() { 
    return (await fetch(128));
};
async function bsc() { 
    return (await fetch(56));
};
async function total() {
    return (await fetch(128)) + (await fetch(56));
};

module.exports = {
    timetravel: false,
    heco: {
        fetch: heco
    },
    bsc: {
        fetch: bsc
    },
    fetch: total
};

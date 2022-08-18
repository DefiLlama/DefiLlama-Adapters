const retry = require('async-retry');
const axios = require("axios");

async function fetch(chainId) {
    return (await retry(async () => 
        await axios.get(`https://brgraph.thesphynx.co/api/v1/tvl/${chainId}`)
    )).data.result
    .map(p => p.tvl)
    .reduce((a, b) => a + parseFloat(b), 0);
}; 

async function brise() { 
    return (await fetch(32520));
};
async function bsc() { 
    return (await fetch(56));
};
async function total() {
    return (await fetch(32520)) + (await fetch(56));
};

module.exports = {
    timetravel: false,
    brise: {
        fetch: brise
    },
    bsc: {
        fetch: bsc
    },
    fetch: total
};

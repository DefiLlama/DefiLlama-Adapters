const { get } = require('../helper/http')

async function fetch(chainId) {
    return (await get(`https://info.mdex.one/pair/tvl?chain_id=${chainId}`)).result
    .map(p => p.tvl)
    .reduce((a, b) => a + parseFloat(b), 0);
} 

async function heco() { 
    return (await fetch(128));
}
async function bsc() { 
    return (await fetch(56));
}

async function bittorrent() {
    return (await fetch(199));
}

async function total() {
    return (await fetch(128)) + (await fetch(56)) + (await fetch(199));
}

module.exports = {
    timetravel: false,
    heco: {
        fetch: heco
    },
    bsc: {
        fetch: bsc
    },
    bittorrent: {
        fetch: bittorrent
    },
    fetch: total
};

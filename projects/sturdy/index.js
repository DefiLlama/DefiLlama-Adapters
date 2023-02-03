const { toUSDTBalances } = require("../helper/balances");
const { fetchURL } = require("../helper/utils");

async function fetch(borrow, chain) {
    const url = "https://us-central1-stu-dashboard-a0ba2.cloudfunctions.net/getVaultMonitoring?tvl=true&chain=" + chain
    const {data} = await fetchURL(url)
    console.log({data, borrow, chain})
    const val = borrow? data.borrowed : data.tvl;
    return toUSDTBalances(val);
}

const borrowed = (chain) => async (_timestamp, _ethBlock, chainBlocks) => {
    return await fetch(true, chain);
}

const tvl = (chain) => async (_timestamp, _ethBlock, chainBlocks) => {
    return await fetch(false, chain);
}

module.exports = {
    fantom: {
        tvl: tvl('ftm'),
        borrowed: borrowed('ftm'),
    },
    ethereum: {
        tvl: tvl('ethereum'),
        borrowed: borrowed('ethereum'),
    },
};
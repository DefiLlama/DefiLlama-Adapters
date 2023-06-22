const { get } = require('../helper/http.js')

async function fetch(arg) {
    const data = await get('https://api-app.pawnfi.com/api/stat/queryplatstatinfo.do')
    return data.info.f_total_tvl;
}

module.exports = {
    timetravel: false,
    methodology: "The Pawnfi API endpoint fetches on-chain data from Pawnfi NFT contracts, token balance for each lending liquidity pools, and any value generated within Pawnfi platform.",
    fetch: fetch,
};
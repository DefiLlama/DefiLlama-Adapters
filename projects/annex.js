const axios = require('axios')

async function bsc() {
    const result = await axios.get(
        "https://api.annex.finance/api/v1/governance/annex");
    return result.data.data.markets.reduce(
        (total, market) => total + Number(market.liquidity), 0);
};

async function cronos() {
    const result = await axios.get(
        "https://cronosapi.annex.finance/api/v1/pools");
    return result.data.pairs.reduce(
        (total, market) => total + Number(market.liquidity), 0);
};

module.exports={
    methodology: 'TVL is comprised of tokens deposited to the protocol as collateral, similar to Compound Finance and other lending protocols the borrowed tokens are not counted as TVL. Data is pull from the Annex API "https://api.annex.finance/api/v1/governance/annex".',
    bsc: {
        fetch: bsc
    },
    cronos: {
        fetch: cronos
    },
    fetch: async () => ( (await bsc()) + (await cronos()) )
}

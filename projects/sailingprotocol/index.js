const sdk = require('@defillama/sdk');
const axios = require('axios');

const PEGS_API_URL = 'https://sailingprotocol.org/api/sailingprotocol/public_analytics/get_onchain_instruments';
const HISTORICAL_PRICING_API_URL = 'https://sailingprotocol.org/api/sailingprotocol/market_data/historical_daily_SPY';

async function getPegsInformation() {
    const pegsInformationResponse = await axios.post(PEGS_API_URL);
    return pegsInformationResponse.data.pegs;
}

async function getPegSupply(api, pegAddress) {
    return await api.call({
        target: pegAddress,
        abi: "erc20:totalSupply",
    }) / 1e18;
}

async function tvl(_0, _1, _2, { api }) {
    const pegs = await getPegsInformation();
    
    // initial version supports SPY (S&P500)
    const spyHistoricalPricing = (await axios.post(HISTORICAL_PRICING_API_URL)).data;
    if (spyHistoricalPricing.length === 0) {
        throw new Error('No SPY pricing information.');
    }
    spyHistoricalPricing.sort((a, b) => new Date(b.date) - new Date(a.date));

    for (const peg of pegs) {
        if (peg.ticker !== 'SPYs' || peg.network.toLowerCase() !== api.chain.toLowerCase()) {
            continue;
        }
        const pegSupply = await getPegSupply(api, peg.address);
        const spyPrice = spyHistoricalPricing[0].close;

        const pegTvl = pegSupply * spyPrice * 1e6;
        api.add("erc20/tether/usdt", pegTvl)
    }
}

module.exports = {
    kava: { tvl, },
    methodology: 'The total supply is extracted from the contract found in the Sailing Protocol API, and this value is multiplied by the latest closing price of the S&P500 to obtain the TVL in USD.'
}

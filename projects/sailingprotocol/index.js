const sdk = require('@defillama/sdk');
const axios = require('axios');

// Fetches pegs from the API
const PEGS_API_URL = 'https://sailingprotocol.org/api/sailingprotocol/public_analytics/get_onchain_instruments';
const HISTORICAL_DATA_API_URL = 'https://sailingprotocol.org/api/sailingprotocol/market_data/historical_daily_SPY';

// Obtiene los pegs de la API
async function fetchPegs() {
    const response = await axios.post(PEGS_API_URL);
    return response.data.pegs;
}

// Fetches the total supply of a peg
async function getPegTVL(networkName, pegAddress) {
    const response = await sdk.api.abi.call({
        target: pegAddress,
        abi: "erc20:totalSupply",
        chain: networkName,
    });

    if (isNaN(response.output)) {
        console.error(`Invalid total supply for contract ${pegAddress}: ${response.output}`);
        return 0;
    }

    return response.output / 1e18;
}

// Fetches the TVL in USD for the chain
async function getChainTvlusd(_0, _1, _2, { api }) {
    try {
        const response = await axios.post(HISTORICAL_DATA_API_URL);
        const historicalData = response.data;
        const pegs = await fetchPegs();
        const address = pegs[0].address;
        const tvlValue = await getPegTVL('kava', address);

        if (historicalData.length > 0) {
            historicalData.sort((a, b) => new Date(b.date) - new Date(a.date));
            const lastPrice = historicalData[0].close;

            const tokenTvl = tvlValue * lastPrice * 1e6;
            api.add("erc20/tether/usdt", tokenTvl)
        } else {
            console.error('No historical data was found in the response.');
        }
    } catch (error) {
        console.error('Error fetching data from the API:', error);
    }
}

module.exports = {
    kava: { tvl: getChainTvlusd },
    methodology: 'The total supply is extracted from the contract found in the Sailing Protocol API, and this value is multiplied by the latest closing price of the S&P500 to obtain the TVL in USD.'
}

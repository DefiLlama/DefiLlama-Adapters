const sdk = require('@defillama/sdk');
const axios = require('axios');

async function fetchPegs() {
    const response = await axios.post('https://sailingprotocol.org/api/sailingprotocol/public_analytics/get_onchain_instruments');
    const pegs = response.data.pegs;

    return pegs;
}

async function getPegTVL(networkName, networkBlockNumber, pegAddress) {
    const response = await sdk.api.abi.call({
        target: pegAddress,
        abi: "erc20:totalSupply",
        chain: networkName,
        block: networkBlockNumber
    });

    if (isNaN(response.output)) {
        console.error(`Invalid total supply for contract ${pegAddress}: ${response.output}`);
        return new 0;
    }

    return response.output;
}

async function tvl(networkName, networkBlockNumber) {
    const pegs = await fetchPegs();

    const pegsTotalSupplies = await Promise.all(
        pegs.map((peg) => getPegTVL(networkName, networkBlockNumber, peg.address))
    );
    pegsTotalSupplies.forEach((pegSupply, index) => {
        pegs[index].tvl = Number(pegSupply) / 1e18;
    });

    const totalTvl = pegs.reduce((acc, peg) => acc + peg.tvl, 0);

    return { 'token1': totalTvl };

}

function getChainTvl() {
    const chain = "kava";
    return async (_timestamp, _ethBlock, chainBlocks) => {
        const tvlValue = await tvl(chain, chainBlocks[chain]);
        console.log(`totalSupply SPYs: ${tvlValue['token1']}`);

        return { ["kava"]: tvlValue['token1'] };
    };
}

function getChainTvlusd() {
    const chain = "kava";
    return async (_timestamp, _ethBlock, chainBlocks) => {
        const tvlValue = await tvl(chain, chainBlocks[chain]);

        try {
            const response = await axios.post('https://sailingprotocol.org/api/sailingprotocol/market_data/historical_daily_SPY');
            const historicalData = response.data;

            if (historicalData.length > 0) {
                historicalData.sort((a, b) => new Date(b.date) - new Date(a.date));
                const lastPrice = historicalData[0].close;
                console.log(`S&P500 last price: ${lastPrice}`);

                return { usd: tvlValue['token1'] * lastPrice };
            } else {
                console.error('No historical data was found in the response.');
                return null;
            }
        } catch (error) {
            console.error('Error fetching data from the API:', error);
            return null;
        }
    };
}

module.exports = {
    kava: { tvl: getChainTvl() },
    tron: { tvl: getChainTvlusd() }
}
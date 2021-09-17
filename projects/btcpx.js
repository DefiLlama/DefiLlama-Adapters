const retry = require('./helper/retry')
const axios = require('axios');
const BigNumber = require('bignumber.js');
const btcPriceEndPoint = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'
const totalSupply = 'https://api.btcpx.io/api/v1/crypto/total-supply/all'

async function fetchTotalSupply() {
    const totalSupplyResponse = await retry(async bail => await axios.get(totalSupply, {
        headers: {
            'x-signature': 'f104e31bbc788b25c12ad65f4063bea9c9a731004212002f3f7c773f9d72f7a1'
        }
    }))
    return totalSupplyResponse.data;
}

async function ethereum() {
    const price_feed = await retry(async bail => await axios.get(btcPriceEndPoint))
    const totalSupplyResponse = await fetchTotalSupply()
    return new BigNumber(totalSupplyResponse['erc20TotalSupply']).multipliedBy(new BigNumber(price_feed.data.bitcoin.usd)).toFixed(2);
}

async function polygon() {
    const price_feed = await retry(async bail => await axios.get(btcPriceEndPoint))
    const totalSupplyResponse = await fetchTotalSupply()
    return new BigNumber(totalSupplyResponse['mrc20TotalSupply']).multipliedBy(new BigNumber(price_feed.data.bitcoin.usd)).toFixed(2);
}

async function fetch() {
    return new BigNumber(await ethereum()).plus(await polygon()).toFixed(2);
}


module.exports = {
    ethereum: {
        fetch: ethereum
    },
    polygon: {
        fetch: polygon
    },
    fetch,
    methodology: `TVL for BTCpx consists of the BTC deposits in custody that were used to mint BTCpx in Ethereum and Polygon`
}

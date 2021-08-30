const retry = require('async-retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");

async function fetch() {

    /*
        Mento is an automated market maker (AMM) type of decentralized exchange that’s native to the Celo platform. It’s responsible 
        for helping the Celo Dollar (cUSD) maintain its peg to the USD. When demand for the stablecoin increases the Celo protocol 
        mints cUSD and ‘sells’ them for CELO (Celo’s native asset) via Mento. The CELO assets are used as cUSD collateral and are 
        stored in the Celo reserve. This all happens on-chain. If demand for cUSD decreases then the reverse process happens. 
        Mento arbitrage opportunities arise in cases where there’s cUSD/USD depeg. This incentive for traders should help 
        restore the cUSD/USD peg.

        More info here: https://medium.com/celoorg/zooming-in-on-the-celo-expansion-contraction-mechanism-446ca7abe4f
    */

    let mento_contract_address = '0x9380fA34Fd9e4Fd14c06305fd7B6199089eD4eb9';

    let celo_price = (await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=celo&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))).data.celo.usd;

    let mento_pooled = (new BigNumber((await retry(async bail => await axios.get('https://explorer.celo.org/api/?module=account&action=balance&address='+mento_contract_address))).data.result)).div(10 ** 18).toFixed(2);
    
    return mento_pooled * celo_price;
}

module.exports = {
    fetch
}
const utils = require('./helper/utils');
const sdk = require('@defillama/sdk')

async function tvl(timestamp, ethBlock, chainBlocks) {
    let balances = {};
    let url = `https://api.data.kava.io/swap/pools`
    if(Math.abs(Date.now()/1000 - timestamp) > 3600){
        const block = await sdk.api.util.lookupBlock(timestamp, {chain:'kava'})
        url += `?height=${block.block}`
    }

    const response = await utils.fetchURL(url);

    for (let pool of response.data.result) {
        for (let coin of pool.coins) {
            let tokenInfo = generic(coin.denom);
            if (balances[tokenInfo[0]]) {
                balances[tokenInfo[0]] += coin.amount / 10**tokenInfo[1];
            } else {
                balances[tokenInfo[0]] = coin.amount / 10**tokenInfo[1];
            };
        };
    };
return balances;
}
function generic(ticker) {
    switch(ticker) {
        case 'bnb': return ['binancecoin',8];
        case 'btcb': return ['bitcoin',8];
        case 'busd': return ['binance-usd',8];
        case 'hard': return ['kava-lend',6];
        case 'swp': return ['kava-swap',6];
        case 'ukava': return ['kava',6];
        case 'xrpb': return ['ripple',8];
        case 'usdx': return ['usdx',6];
    };
};

module.exports = {
    tvl
}
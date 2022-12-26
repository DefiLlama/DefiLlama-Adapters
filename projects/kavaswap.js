const utils = require('./helper/utils');
const sdk = require('@defillama/sdk')

async function tvl(timestamp, ethBlock, chainBlocks) {
    let balances = {};
    let url = `https://api2.kava.io/swap/pools`
    if(Math.abs(Date.now()/1000 - timestamp) > 3600){
        const block = await sdk.api.util.lookupBlock(timestamp, {chain:'kava'})
        url += `?height=${block.block}`
    }

    const response = await utils.fetchURL(url);

    for (let pool of response.data.result) {
        for (let coin of pool.coins) {
            let tokenInfo = generic(coin.denom);
            if(!tokenInfo) {
                console.log('unknown token', coin.denom)
                continue;
            }
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
        case 'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2': return ['cosmos',6];
        case 'ibc/799FDD409719A1122586A629AE8FCA17380351A51C1F47A80A1B8E7F2A491098': return ['akash-network',6];
        case 'ibc/B8AF5D92165F35AB31F3FC7C7B444B9D240760FA5D406C49D24862BD0284E395': return ['terra-luna',6];
        case 'ibc/0471F1C4E7AFD3F07702BEF6DC365268D64570F7C1FDC98EA6098DD6DE59817B': return ['osmosis',6];
        case 'ibc/B448C0CA358B958301D328CCDC5D5AD642FC30A6D3AE106FF721DB315F3DDE5C': return ['terrausd',6];
    };
};

module.exports = {
    timetravel: false,
    kava: { tvl }
}
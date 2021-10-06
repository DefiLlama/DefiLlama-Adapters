const retry = require('./helper/retry')
const axios = require("axios");

const KAVA_DENOM = "ukava";
const HARD_DENOM = "hard";
const USDX_DENOM = "usdx";
const BNB_DENOM = "bnb";
const BTC_DENOM = "btcb";
const BUSD_DENOM = "busd";
const XRPB_DENOM = "xrpb";
const coingeckoIds = {
    [KAVA_DENOM]: 'kava',
    [HARD_DENOM]:'kava-lend',
    [USDX_DENOM]:'usdx',
    [BNB_DENOM]:'binancecoin',
    [BTC_DENOM]:'bitcoin',
    [BUSD_DENOM]:'binance-usd',
    [XRPB_DENOM]:'ripple'
}
const decimals = {
    [KAVA_DENOM]: 6,
    [HARD_DENOM]:6,
    [USDX_DENOM]:6,
    [BNB_DENOM]:8,
    [BTC_DENOM]:8,
    [BUSD_DENOM]:8,
    [XRPB_DENOM]:8
}

var tvl = async () => {
    const balances = {}
    const totalDeposited = await retry(async bail => await axios.get('https://api.kava.io/hard/total-deposited'))
    const totalBorrowed = await retry(async bail => await axios.get('https://api.kava.io/hard/total-borrowed'))
    for(const coin of totalDeposited.data.result){
        const borrowed = Number(totalBorrowed.data.result.find(item=>item.denom === coin.denom)?.amount || 0);
        balances[coingeckoIds[coin.denom]]=(Number(coin.amount)-borrowed)/(10**decimals[coin.denom]);
    }
    return balances;
}

module.exports = {
  tvl
}

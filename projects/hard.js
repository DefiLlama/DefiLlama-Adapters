const retry = require('./helper/retry')
const axios = require("axios");

const KAVA_DENOM = "ukava";
const HARD_DENOM = "hard";
const USDX_DENOM = "usdx";
const BNB_DENOM = "bnb";
const BTC_DENOM = "btcb";
const BUSD_DENOM = "busd";
const XRPB_DENOM = "xrpb";
const ATOM_DENOM = "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2"
const AKT_DENOM = "ibc/799FDD409719A1122586A629AE8FCA17380351A51C1F47A80A1B8E7F2A491098"
const coingeckoIds = {
    [KAVA_DENOM]: 'kava',
    [HARD_DENOM]:'kava-lend',
    [USDX_DENOM]:'usdx',
    [BNB_DENOM]:'binancecoin',
    [BTC_DENOM]:'bitcoin',
    [BUSD_DENOM]:'binance-usd',
    [XRPB_DENOM]:'ripple',
    [ATOM_DENOM]:'cosmos',
    [AKT_DENOM]:'akash-network'
}
const decimals = {
    [KAVA_DENOM]: 6,
    [HARD_DENOM]:6,
    [USDX_DENOM]:6,
    [BNB_DENOM]:8,
    [BTC_DENOM]:8,
    [BUSD_DENOM]:8,
    [XRPB_DENOM]:8,
    [ATOM_DENOM]:6,
    [AKT_DENOM]:6
}

var tvl = async () => {
    const balances = {}
    const totalDeposited = await retry(async bail => await axios.get('https://api2.kava.io/hard/total-deposited'))
    const totalBorrowed = await retry(async bail => await axios.get('https://api2.kava.io/hard/total-borrowed'))
    for(const coin of totalDeposited.data.result){
        const borrowed = Number(totalBorrowed.data.result.find(item=>item.denom === coin.denom)?.amount || 0);
        balances[coingeckoIds[coin.denom]]=(Number(coin.amount)-borrowed)/(10**decimals[coin.denom]);
    }
    return balances;
}

var borrowed = async () => {
    const balances = {}
    const totalBorrowed = await retry(async bail => await axios.get('https://api2.kava.io/hard/total-borrowed'))
    for(const coin of totalBorrowed.data.result){
        balances[coingeckoIds[coin.denom]]=Number(coin.amount)/(10**decimals[coin.denom]);
    }
    return balances;
}


module.exports = {
    timetravel: false,
    kava:{
        tvl,
        borrowed
    }
}

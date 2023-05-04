const { get } = require('./helper/http');

const KAVA_DENOM = "ukava";
const HARD_DENOM = "hard";
const USDX_DENOM = "usdx";
const BNB_DENOM = "bnb";
const BTC_DENOM = "btcb";
const BUSD_DENOM = "busd";
const XRPB_DENOM = "xrpb";
const ATOM_DENOM = "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2";
const AKT_DENOM = "ibc/799FDD409719A1122586A629AE8FCA17380351A51C1F47A80A1B8E7F2A491098";
const AXLUSDC_DENOM = "erc20/axelar/usdc";
const MULTICHAIN_WBTC = "erc20/multichain/wbtc";
const MULTICHAIN_USDC = "erc20/multichain/usdc";
const MULTICHAIN_USDT = "erc20/multichain/usdt";

const coingeckoIds = {
    [KAVA_DENOM]: 'kava',
    [HARD_DENOM]: 'kava-lend',
    [USDX_DENOM]: 'usdx',
    [BNB_DENOM]: 'binancecoin',
    [BTC_DENOM]: 'bitcoin',
    [BUSD_DENOM]: 'binance-usd',
    [XRPB_DENOM]: 'ripple',
    [ATOM_DENOM]: 'cosmos',
    [AKT_DENOM]: 'akash-network',
    [AXLUSDC_DENOM]: 'axlusdc',
    [MULTICHAIN_WBTC]: 'wrapped-bitcoin',
    [MULTICHAIN_USDC]: 'usd-coin',
    [MULTICHAIN_USDT]: 'tether',
}
const decimals = {
    [KAVA_DENOM]: 6,
    [HARD_DENOM]: 6,
    [USDX_DENOM]: 6,
    [BNB_DENOM]: 8,
    [BTC_DENOM]: 8,
    [BUSD_DENOM]: 8,
    [XRPB_DENOM]: 8,
    [ATOM_DENOM]: 6,
    [AKT_DENOM]: 6,
    [AXLUSDC_DENOM]: 6,
    [MULTICHAIN_WBTC]: 8,
    [MULTICHAIN_USDC]: 6,
    [MULTICHAIN_USDT]: 6,
    [AXLUSDC_DENOM]: 6,
    [AXLUSDC_DENOM]: 6,
}

const tvl = async (_, _1, _2, { api }) => {
    const totalDeposited = await get('https://api2.kava.io/hard/total-deposited');
    const totalBorrowed = await get('https://api2.kava.io/hard/total-borrowed');

    for (const coin of totalDeposited.result) {
        const borrowed = Number(totalBorrowed.result.find(item => item.denom === coin.denom)?.amount || 0);
        api.add(coingeckoIds[coin.denom], (coin.amount - borrowed) / (10 ** decimals[coin.denom]), { skipChain: true })
    }
}

const borrowed = async (_, _1, _2, { api }) => {
    const totalBorrowed = await get('https://api2.kava.io/hard/total-borrowed');

    for (const coin of totalBorrowed.result) {
        api.add(coingeckoIds[coin.denom], coin.amount / (10 ** decimals[coin.denom]), { skipChain: true })
    }

}


module.exports = {
    timetravel: false,
    kava: {
        tvl,
        borrowed
    }
}

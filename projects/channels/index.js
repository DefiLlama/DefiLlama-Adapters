const _ = require('underscore');
const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const { unwrapUniswapLPs } = require('../helper/unwrapLPs');
const { default: BigNumber } = require('bignumber.js');
const comptroller = {
    heco: "0x8955aeC67f06875Ee98d69e6fe5BDEA7B60e9770",
    bsc: "0x8Cd2449Ed0469D90a7C4321DF585e7913dd6E715",
    arbitrum: "0x3C13b172bf8BE5b873EB38553feC50F78c826284"
}
// ask comptroller for all markets array
async function getAllCTokens(block, chain) {
    return (await sdk.api.abi.call({
        block,
        chain: chain,
        target: comptroller[chain],
        params: [],
        abi: abi['getAllMarkets'],
    })).output;
}
async function getUnderlying(block, cToken, chain) {
    if (cToken === '0x397c6D1723360CC1c317CdC9B2E926Ae29626Ff3') {
        return '0x6f259637dcd74c767781e37bc6133cd6a68aa161';//cHT => HT
    } else if (cToken === '0x14E134365F754496FBC70906b8611b8b49f66dd4'){
        return '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';//cBNB =>BNB
    } else {
        const token = (await sdk.api.abi.call({
            block,
            chain: chain,
            target: cToken,
            abi: abi['underlying'],
        })).output;
        if (token === '0x3D760a45D0887DFD89A2F5385a236B29Cb46ED2a') {
            return '0x6b175474e89094c44da98b954eedeac495271d0f';//DAI => DAI
        } else if (token === '0x9362Bbef4B8313A8Aa9f0c9808B80577Aa26B73B') {
            return '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';//USDC => USDC
        } else {
            return chain + ':' + token
        }
    }
}

// returns {[underlying]: [cToken]}
async function getMarkets(block, chain) {
    let allCTokens = await getAllCTokens(block, chain)
    const markets = []
    await (
        Promise.all(allCTokens.map(async (cToken) => {
            let underlying = await getUnderlying(block, cToken, chain);
            markets.push({ underlying, cToken })
        }))
    );
    return markets;
}
const replacements = {
    "heco:0xA2F3C2446a3E20049708838a779Ff8782cE6645a": 'bsc:0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe',
    "heco:0x843Af718EF25708765a8E0942F89edEae1D88DF0": 'bsc:0x3ee2200efb3400fabb9aacf31297cbdd1d435d47',
}
async function chainTvl(chain) {
    let balances = {};
    let timestamp = Math.round(new Date() / 1000)
    let currentBlock = (await sdk.api.util.lookupBlock(timestamp, { chain: chain }))
    let markets = await getMarkets(currentBlock.block, chain);
    let LockedInfo = await sdk.api.abi.multiCall({
        currentBlock,
        calls: _.map(markets, (market) => ({
            target: market.cToken,
        })),
        chain: chain,
        abi: abi['getCash'],
    });
    const symbols = await sdk.api.abi.multiCall({
        //block: currentBlock,
        calls: _.map(markets, (market) => ({
            target: market.underlying.split(':')[1],
        })),
        chain: chain,
        abi: "erc20:symbol",
    });
    const lpPositions = []

    _.each(markets, (market, idx) => {
        let getCash = _.find(LockedInfo.output, (result) => result.input.target === market.cToken);
        if (getCash.output === null) {
            throw new Error("failed")
        }
        const symbol = symbols.output[idx].output
        if (["HMDX", "Cake-LP"].includes(symbol)) {
            lpPositions.push({
                token: market.underlying.split(':')[1],
                balance: getCash.output
            })
        } else if (symbol === "BETH") {
            sdk.util.sumSingleBalance(balances, 'binance-eth', Number(getCash.output) / 1e18)
        } else if(replacements[market.underlying] !== undefined){
            sdk.util.sumSingleBalance(balances, replacements[market.underlying], BigNumber(getCash.output).times(1e12).toFixed(0))
        } else {
            sdk.util.sumSingleBalance(balances, market.underlying, getCash.output)
        }
    });
    await unwrapUniswapLPs(balances, lpPositions, undefined, chain, addr => {
        if (addr === "0x5545153ccfca01fbd7dd11c0b23ba694d9509a6f") {
            return '0x6f259637dcd74c767781e37bc6133cd6a68aa161' // WHT -> HT
        }
        return `${chain}:${addr}`
    })
    return balances;
}

async function hecoTvl() {
    return await chainTvl('heco');
}
async function bscTvl() {
    return await chainTvl('bsc');
}
async function arbitrumTvl() {
    return await chainTvl('arbitrum');
}

module.exports = {
    heco: {
        tvl: hecoTvl
    },
    bsc: {
        tvl: bscTvl
    },
    arbitrum: {
        tvl: arbitrumTvl
    },
    tvl: sdk.util.sumChainTvls([hecoTvl, bscTvl, arbitrumTvl])
};

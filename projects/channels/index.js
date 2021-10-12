const _ = require('underscore');
const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const { unwrapUniswapLPs } = require('../helper/unwrapLPs');
const { default: BigNumber } = require('bignumber.js');

const comptroller = "0x8955aeC67f06875Ee98d69e6fe5BDEA7B60e9770"

// ask comptroller for all markets array
async function getAllCTokens(block) {
    return (await sdk.api.abi.call({
        block,
        chain: "heco",
        target: comptroller,
        params: [],
        abi: abi['getAllMarkets'],
    })).output;
}

async function getUnderlying(block, cToken) {
    if (cToken === '0x397c6D1723360CC1c317CdC9B2E926Ae29626Ff3') {
        return '0x6f259637dcd74c767781e37bc6133cd6a68aa161';//cHT => HT
    } else {
        const token = (await sdk.api.abi.call({
            block,
            chain: 'heco',
            target: cToken,
            abi: abi['underlying'],
        })).output;
        if (token === '0x3D760a45D0887DFD89A2F5385a236B29Cb46ED2a') {
            return '0x6b175474e89094c44da98b954eedeac495271d0f';//DAI => DAI
        } else if (token === '0x9362Bbef4B8313A8Aa9f0c9808B80577Aa26B73B') {
            return '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';//USDC => USDC
        } else if(token === "0x5eE41aB6edd38cDfB9f6B4e6Cf7F75c87E170d98"){
            return "0x0000000000085d4780b73119b644ae5ecd22b376" //TUSD
        } else {
            return 'heco:' + token
        }
    }
}

// returns {[underlying]: [cToken]}
async function getMarkets(block) {
    let allCTokens = await getAllCTokens(block);
    const markets = []
    await (
        Promise.all(allCTokens.map(async (cToken) => {
            let underlying = await getUnderlying(block, cToken);
            markets.push({ underlying, cToken })
        }))
    );
    return markets;
}

const replacements = {
    "heco:0xA2F3C2446a3E20049708838a779Ff8782cE6645a": 'bsc:0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe',
    "heco:0x843Af718EF25708765a8E0942F89edEae1D88DF0": 'bsc:0x3ee2200efb3400fabb9aacf31297cbdd1d435d47',
}

async function tvl() {
    let balances = {};
    let timestamp = Math.round(new Date() / 1000)
    //let currentBlock = (await sdk.api.util.lookupBlock(timestamp, {chain: "heco"}))
    let markets = await getMarkets();
    let LockedInfo = await sdk.api.abi.multiCall({
        //block: currentBlock,
        calls: _.map(markets, (market) => ({
            target: market.cToken,
        })),
        chain: 'heco',
        abi: abi['getCash'],
    });
    const symbols = await sdk.api.abi.multiCall({
        //block: currentBlock,
        calls: _.map(markets, (market) => ({
            target: market.underlying.split(':')[1],
        })),
        chain: 'heco',
        abi: "erc20:symbol",
    });
    const lpPositions = []

    _.each(markets, (market, idx) => {
        let getCash = _.find(LockedInfo.output, (result) => result.input.target === market.cToken);
        if (getCash.output === null) {
            throw new Error("failed")
        }
        const symbol = symbols.output[idx].output
        if (symbol === "HMDX") {
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
    await unwrapUniswapLPs(balances, lpPositions, undefined, 'heco', addr => {
        if (addr === "0x5545153ccfca01fbd7dd11c0b23ba694d9509a6f") {
            return '0x6f259637dcd74c767781e37bc6133cd6a68aa161' // WHT -> HT
        }
        return `heco:${addr}`
    })
    return balances;
}

module.exports = {
    tvl,
};
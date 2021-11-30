const _ = require('underscore');
const sdk = require('@defillama/sdk');
const abi = require('./abis/compound.json');

// ask comptroller for all markets array
async function getAllCTokens(comptroller, block, chain) {
    return (await sdk.api.abi.call({
        block,
        target: comptroller,
        params: [],
        abi: abi['getAllMarkets'],
        chain
    })).output;
}

async function getUnderlying(block, chain, cToken, cether, cetheEquivalent) {
    if(cToken === cether){
        return cetheEquivalent
    }
    if (cToken === '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5') {
        return '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';//cETH => WETH
    }
    if(cToken === '0x5C0401e81Bc07Ca70fAD469b451682c0d747Ef1c' && chain === 'avax'){
        return "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"
    }
    return (await sdk.api.abi.call({
        block,
        target: cToken,
        abi: abi['underlying'],
        chain
    })).output;
}

// returns {[underlying]: {cToken, decimals, symbol}}
async function getMarkets(comptroller, block, chain, cether, cetheEquivalent) {
    let allCTokens = await getAllCTokens(comptroller, block, chain);
    const markets = []
    // if not in cache, get from the blockchain
    await (
        Promise.all(allCTokens.map(async (cToken) => {
            try{
                let underlying = await getUnderlying(block, chain, cToken, cether, cetheEquivalent);
                markets.push({ underlying, cToken })
            } catch(e){
                console.log(`${cToken} market rugged, is that market CETH?`)
                throw e
            }
        }))
    );

    return markets;
}

function getCompoundV2Tvl(comptroller, chain="ethereum", transformAdress = addr=>addr, cether="0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5", cetheEquivalent="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2") {
    return async (timestamp, ethBlock, chainBlocks) => {
        const block = chainBlocks[chain]
        let balances = {};
        let markets = await getMarkets(comptroller, block, chain, cether, cetheEquivalent);

        // Get V2 tokens locked
        let v2Locked = await sdk.api.abi.multiCall({
            block,
            chain,
            calls: _.map(markets, (market) => ({
                target: market.cToken,
            })),
            abi: abi['getCash'],
        });

        _.each(markets, (market) => {
            let getCash = _.find(v2Locked.output, (result) => result.input.target === market.cToken);

            sdk.util.sumSingleBalance(balances, transformAdress(market.underlying), getCash.output)
        });
        return balances;
    }
}

const BigNumber = require('bignumber.js').default;
const { toUSDTBalances } = require('./balances');

// ask comptroller for all markets array
async function getAllMarkets(block, chain, comptroller) {
    const { output: markets } = await sdk.api.abi.call({
        target: comptroller,
        abi: abi['getAllMarkets'],
        block,
        chain: chain,
    });
    return markets;
}

// ask comptroller for oracle
async function getOracle(block, chain, comptroller, oracleAbi) {
    const { output: oracle } = await sdk.api.abi.call({
        target: comptroller,
        abi: oracleAbi,
        block,
        chain: chain,
    });
    return oracle;
}

async function getUnderlyingDecimals(block, chain, token, cether) {
    if (token.toLowerCase() === cether?.toLowerCase()) {
        return 18;
    }

    try {
        const { output: underlying } = await sdk.api.abi.call({
            target: token,
            abi: abi['underlying'],
            block,
            chain: chain,
        });
        const { output: decimals } = await sdk.api.abi.call({
            target: underlying,
            abi: "erc20:decimals",
            block,
            chain: chain,
        });
        return decimals;
    } catch (e) {
        console.log(`${token} market rugged, is that market CETH?`)
        throw e
    }
}

async function getUnderlyingPrice(block, chain, oracle, token, methodAbi) {
    const { output: underlyingPrice } = await sdk.api.abi.call({
        target: oracle,
        abi: methodAbi,
        block,
        params: [token],
        chain: chain,
    });
    return underlyingPrice;
}

async function getCash(block, chain, token) {
    const { output: cash } = await sdk.api.abi.call({
        target: token,
        abi: abi['getCash'],
        block,
        chain: chain,
    });
    return cash;
}

function getCompoundUsdTvl(comptroller, chain, cether, abis={
    oracle: abi['oracle'],
    underlyingPrice: abi['getUnderlyingPrice']
}) {
    return async (timestamp, ethBlock, chainBlocks) => {
        const block = chainBlocks[chain]
        let tvl = new BigNumber('0');

        let allMarkets = await getAllMarkets(block, chain, comptroller);
        let oracle = await getOracle(block, chain, comptroller, abis.oracle);

        await Promise.all(
            allMarkets.map(async token => {
                let cash = new BigNumber(await getCash(block, chain, token));
                let decimals = await getUnderlyingDecimals(block, chain, token, cether);
                let locked = cash.div(10 ** decimals);
                let underlyingPrice = new BigNumber(await getUnderlyingPrice(block, chain, oracle, token, abis.underlyingPrice)).div(
                    10 ** (18 + 18 - decimals)
                );
                tvl = tvl.plus(locked.times(underlyingPrice));
            })
        );
        return toUSDTBalances(tvl.toNumber());
    }
}

module.exports = {
    getCompoundV2Tvl,
    getCompoundUsdTvl,
};

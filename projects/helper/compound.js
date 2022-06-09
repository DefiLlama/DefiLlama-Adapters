
const sdk = require('@defillama/sdk');
const abi = require('./abis/compound.json');
const { getBlock } = require('./getBlock');
const { unwrapUniswapLPs } = require('./unwrapLPs');
const { fixHarmonyBalances, fixOasisBalances, transformMetisAddress, fixBscBalances } = require('./portedTokens');
const { usdtAddress } = require('./balances');
const agoraAbi = require("./../agora/abi.json");
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
    if (cToken === cether) {
        return cetheEquivalent
    }
    if (cToken === '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5') {
        return '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';//cETH => WETH
    }
    if (cToken === '0x5C0401e81Bc07Ca70fAD469b451682c0d747Ef1c' && chain === 'avax') {
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
            try {
                let underlying = await getUnderlying(block, chain, cToken, cether, cetheEquivalent);
                markets.push({ underlying, cToken })
            } catch (e) {
                console.log(`${cToken} market rugged, is that market CETH?`)
                throw e
            }
        }))
    );

    return markets;
}
async function unwrapPuffTokens(balances, lpPositions, block) {
    const pricePerShare = (await sdk.api.abi.multiCall({
        block,
        abi: agoraAbi.getPricePerFullShare,
        calls: lpPositions.map(p => ({
            target: p.token
        })),
        chain: 'metis'
    })).output;
    const underlying = (await sdk.api.abi.multiCall({
        block,
        abi: agoraAbi.want,
        calls: lpPositions.map(p => ({
            target: p.token
        })),
        chain: 'metis'
    })).output;

    const newLpPositions = [];
    for (let i = 0; i < lpPositions.length; i++) {
        newLpPositions.push({ balance: lpPositions[i].balance * pricePerShare[i].output / 10 ** 18, token: underlying[i].output })
    };

    await unwrapUniswapLPs(
        balances,
        newLpPositions,
        block,
        'metis',
        transformMetisAddress()
    );
};
function getCompoundV2Tvl(comptroller, chain = "ethereum", transformAdress = addr => addr, cether = "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5", cetheEquivalent = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", borrowed = false, checkForLPTokens = undefined) {
    return async (timestamp, ethBlock, chainBlocks) => {
        const block = await getBlock(timestamp, chain, chainBlocks, true);
        let balances = {};
        let markets = await getMarkets(comptroller, block, chain, cether, cetheEquivalent);

        // Get V2 tokens locked
        let v2Locked = await sdk.api.abi.multiCall({
            block,
            chain,
            calls: markets.map((market) => ({
                target: market.cToken,
            })),
            abi: borrowed ? abi.totalBorrows : abi['getCash'],
        });

        let symbols;
        if (checkForLPTokens !== undefined) {
            symbols = await sdk.api.abi.multiCall({
                block,
                chain,
                calls: markets.map((market) => ({
                    target: market.cToken,
                })),
                abi: "erc20:symbol",
            });
        }

        const lpPositions = []
        markets.forEach((market, idx) => {
            let getCash = v2Locked.output.find((result) => result.input.target === market.cToken);
            if (checkForLPTokens !== undefined && checkForLPTokens(symbols.output[idx].output)) {
                lpPositions.push({
                    token: market.underlying,
                    balance: getCash.output
                })
            } else {
                sdk.util.sumSingleBalance(balances, transformAdress(market.underlying), getCash.output)
            }
        });
        if (chain == "harmony") {
            fixHarmonyBalances(balances);
        } else if (chain == "oasis") {
            fixOasisBalances(balances);
        } else if (chain == "bsc") {
            fixBscBalances(balances);
        }
        if (comptroller == "0x92DcecEaF4c0fDA373899FEea00032E8E8Da58Da") {
            await unwrapPuffTokens(balances, lpPositions, block)
        } else if (lpPositions.length > 0) {
            await unwrapUniswapLPs(balances, lpPositions, block, chain, transformAdress)
        }
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

async function getUnderlyingDecimalsMultiple(block, chain, tokens, cether) {
    const response = {}
    const otherTokens = []
    tokens.forEach(token => {
        if (token.toLowerCase() === cether?.toLowerCase()) {
            response[token] = 18
        } else {
            otherTokens.push(token)
        }
    })

    try {
        const underLyingCalls = otherTokens.map(t => ({ target: t }))
        const { output: underlying } = await sdk.api.abi.multiCall({
            calls: underLyingCalls,
            abi: abi['underlying'],
            block,
            chain,
        });

        const failed = underlying.find(i => !i.success)
        if (failed) throw new Error('Something failed: ' + failed.input.target)

        const underlyingMapping = {}
        const decimalsCalls = underlying.map(({ output }) => ({ target: output }))
        underlying.forEach(({ input, output }) => underlyingMapping[output] = input.target)
        const { output: decimals } = await sdk.api.abi.multiCall({
            calls: decimalsCalls,
            abi: "erc20:decimals",
            block,
            chain,
        });
        decimals.forEach(({ input, output }, i) => response[underlying[i].input.target] = output)
        return response;
    } catch (e) {
        console.log(`${e.message} market rugged, is that market CETH?`)
        throw e
    }
}

async function getCashMultiple(block, chain, tokens, borrowed) {
    const calls = tokens.map(t => ({ target: t }))
    const { output: cash } = await sdk.api.abi.multiCall({
        calls,
        abi: borrowed ? abi.totalBorrows : abi['getCash'],
        block,
        chain,
    });
    const response = {}
    cash.forEach(({ input, output }) => response[input.target] = output)
    return response;
}

async function getUnderlyingPriceMultiple(block, chain, oracle, tokens, methodAbi) {
    const calls = tokens.map(t => ({ params: [t] }))
    const { output: underlyingPrice } = await sdk.api.abi.multiCall({
        target: oracle,
        abi: methodAbi,
        block,
        chain,
        calls,
    });
    const response = {}
    underlyingPrice.forEach(({ input, output }) => response[input.params[0]] = output)
    return response;
}


function getCompoundUsdTvl(comptroller, chain, cether, borrowed, abis = {
    oracle: abi['oracle'],
    underlyingPrice: abi['getUnderlyingPrice']
}, {
    blacklist =[]
} = {}) {
    return async (timestamp, ethBlock, chainBlocks) => {
        const block = await getBlock(timestamp, chain, chainBlocks, true);
        let tvl = new BigNumber('0');
        blacklist = blacklist.map(i => i.toLowerCase())
        let allMarkets = await getAllMarkets(block, chain, comptroller);
        allMarkets = allMarkets.filter(token => !blacklist.includes(token.toLowerCase()))
        let oracle = await getOracle(block, chain, comptroller, abis.oracle);
        const amounts = await getCashMultiple(block, chain, allMarkets, borrowed)
        const decimalsAll = await getUnderlyingDecimalsMultiple(block, chain, allMarkets, cether)
        const underlyingPrices = await getUnderlyingPriceMultiple(block, chain, oracle, allMarkets, abis.underlyingPrice)

        allMarkets.forEach(token => {
            let amount = new BigNumber(amounts[token]);
            let decimals = decimalsAll[token];
            let locked = amount.div(10 ** decimals);
            let underlyingPrice = new BigNumber(underlyingPrices[token]).div(10 ** (18 + 18 - decimals))
            tvl = tvl.plus(locked.times(underlyingPrice));
        })
        return toUSDTBalances(tvl.toNumber());
    }
}

function compoundExports(comptroller, chain, cether, cetheEquivalent, transformAdressRaw, checkForLPTokens) {
    const transformAddress = transformAdressRaw === undefined ? addr => `${chain}:${addr}` : transformAdressRaw
    if (cether !== undefined && cetheEquivalent === undefined) {
        throw new Error("You need to define the underlying for native cAsset")
    }
    return {
        tvl: getCompoundV2Tvl(comptroller, chain, transformAddress, cether, cetheEquivalent, false, checkForLPTokens),
        borrowed: getCompoundV2Tvl(comptroller, chain, transformAddress, cether, cetheEquivalent, true, checkForLPTokens)
    }
}

function compoundExportsWithAsyncTransform(comptroller, chain, cether, cetheEquivalent, transformAdressConstructor) {
    return {
        tvl: async (...args) => {
            const transformAddress = await transformAdressConstructor()
            return getCompoundV2Tvl(comptroller, chain, transformAddress, cether, cetheEquivalent)(...args)
        },
        borrowed: async (...args) => {
            const transformAddress = await transformAdressConstructor()
            return getCompoundV2Tvl(comptroller, chain, transformAddress, cether, cetheEquivalent, true)(...args)
        },
    }
}

function fullCoumpoundExports(comptroller, chain, cether, cetheEquivalent, transformAdress) {
    return {
        timetravel: true,
        doublecounted: false,
        [chain]: compoundExports(comptroller, chain, cether, cetheEquivalent, transformAdress)
    }
}

function usdCompoundExports(comptroller, chain, cether, abis, options = {}) {
    return {
        tvl: getCompoundUsdTvl(comptroller, chain, cether, false, abis, options,),
        borrowed: getCompoundUsdTvl(comptroller, chain, cether, true, abis, options,)
    }
}

function compoundExportsWithDifferentBase(comptroller, chain, token) {
    const raw = usdCompoundExports(comptroller, chain)
    async function tvl(...params) {
        const tvl = await raw.tvl(...params)
        return {
            [token]: Number(tvl[usdtAddress]) / 1e6
        }
    }

    async function borrowed(...params) {
        const tvl = await raw.borrowed(...params)
        return {
            [token]: Number(tvl[usdtAddress]) / 1e6
        }
    }
    return {
        tvl,
        borrowed
    }
}

module.exports = {
    getCompoundV2Tvl,
    compoundExports,
    compoundExportsWithAsyncTransform,
    fullCoumpoundExports,
    usdCompoundExports,
    compoundExportsWithDifferentBase
};

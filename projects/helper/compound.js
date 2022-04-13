const _ = require('underscore');
const sdk = require('@defillama/sdk');
const abi = require('./abis/compound.json');
const { getBlock } = require('./getBlock');
const { unwrapUniswapLPs } = require('./unwrapLPs');
const { fixHarmonyBalances, fixOasisBalances, transformMetisAddress, } = require('./portedTokens');
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
            calls: _.map(markets, (market) => ({
                target: market.cToken,
            })),
            abi: borrowed ? abi.totalBorrows : abi['getCash'],
        });

        let symbols;
        if (checkForLPTokens !== undefined) {
            symbols = await sdk.api.abi.multiCall({
                block,
                chain,
                calls: _.map(markets, (market) => ({
                    target: market.cToken,
                })),
                abi: "erc20:symbol",
            });
        }

        const lpPositions = []
        _.each(markets, (market, idx) => {
            let getCash = _.find(v2Locked.output, (result) => result.input.target === market.cToken);
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

async function getCash(block, chain, token, borrowed) {
    const { output: cash } = await sdk.api.abi.call({
        target: token,
        abi: borrowed ? abi.totalBorrows : abi['getCash'],
        block,
        chain: chain,
    });
    return cash;
}

function getCompoundUsdTvl(comptroller, chain, cether, borrowed, abis = {
    oracle: abi['oracle'],
    underlyingPrice: abi['getUnderlyingPrice']
}) {
    return async (timestamp, ethBlock, chainBlocks) => {
        const block = await getBlock(timestamp, chain, chainBlocks, true);
        let tvl = new BigNumber('0');

        let allMarkets = await getAllMarkets(block, chain, comptroller);
        let oracle = await getOracle(block, chain, comptroller, abis.oracle);
        await Promise.all(
            allMarkets.map(async token => {
                let amount = new BigNumber(await getCash(block, chain, token, borrowed));
                let decimals = await getUnderlyingDecimals(block, chain, token, cether);
                let locked = amount.div(10 ** decimals);
                let underlyingPrice = new BigNumber(await getUnderlyingPrice(block, chain, oracle, token, abis.underlyingPrice)).div(
                    10 ** (18 + 18 - decimals)
                )
                    
                /*
                Uncomment for debugging
                console.log(
                    //token, 
                    (await sdk.api.erc20.symbol(token, chain)).output, 
                    //locked.times(underlyingPrice).toNumber()/1e6, 
                    underlyingPrice.toNumber(), 
                    //amount.toNumber()
                )
                */
                tvl = tvl.plus(locked.times(underlyingPrice));
            })
        );
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

function usdCompoundExports(comptroller, chain, cether, abis) {
    return {
        tvl: getCompoundUsdTvl(comptroller, chain, cether, false, abis),
        borrowed: getCompoundUsdTvl(comptroller, chain, cether, true, abis)
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

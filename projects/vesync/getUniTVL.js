
const { BigNumber } = require('ethers');
const uniswapAbi = require('../helper/abis/uniswap');
const { getCache, setCache, } = require('../helper/cache');
const { getCoreAssets } = require('../helper/tokenMapping');
const { transformBalances, transformDexBalances, } = require('../helper/portedTokens');
const { sliceIntoChunks, sleep } = require('../helper/utils')
const sdk = require('@defillama/sdk')

const cacheFolder = 'uniswap-forks'

// some zksync stablecoins are not in default list
// we want to count those in TVL too by counting them as USDC
const usdcEquivalence = {
    "0x496d88D1EFc3E145b7c12d53B78Ce5E7eda7a42c": {
        coingeckoName: "coingecko:tether",
        decimals: 18,
    },
    "0x1382628e018010035999A1FF330447a0751aa84f": {
        coingeckoName: "coingecko:izumi-bond-usd",
        decimals: 18,
    },
    "0x8E86e46278518EFc1C5CEd245cBA2C7e3ef11557": {
        coingeckoName: "coingecko:usd",
        decimals: 6,
    },
    "0x2039bb4116B4EFc145Ec4f0e2eA75012D6C0f181": {
        coingeckoName: "coingecko:binance-usd",
        decimals: 18,
    }
};

const usdcAddress = '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4';
const usdcDecimals = 6;

function getUniTVL({ coreAssets, blacklist = [], factory, blacklistedTokens,
    useDefaultCoreAssets = false,
    fetchBalances = false,
    abis = {},
    chain: _chain = 'ethereum',
    queryBatched = 0,
    waitBetweenCalls,
    hasStablePools = false,
    stablePoolSymbol = 'sAMM',
}) {

    let updateCache = false

    const abi = { ...uniswapAbi, ...abis }
    factory = factory.toLowerCase()
    blacklist = (blacklistedTokens || blacklist).map(i => i.toLowerCase())

    return async (_, _b, cb, { api, chain } = {}) => {

        if (!chain)
            chain = _chain
        const key = `${factory}-${chain}`

        if (!coreAssets && useDefaultCoreAssets)
            coreAssets = getCoreAssets(chain)

        let cache = await _getCache(cacheFolder, key, api)

        const _oldPairInfoLength = cache.pairs.length
        const length = await api.call({ abi: abi.allPairsLength, target: factory, })
        sdk.log(chain, ' No. of pairs: ', length)
        sdk.log('cached info', cache.pairs.length)
        const pairCalls = []
        for (let i = _oldPairInfoLength; i < length; i++)
            pairCalls.push(i)

        const calls = await api.multiCall({ abi: abi.allPairs, calls: pairCalls, target: factory })

        const [
            token0s, token1s
        ] = await Promise.all([
            api.multiCall({ abi: abi.token0, calls }),
            api.multiCall({ abi: abi.token1, calls }),
        ])
        let symbols
        if (hasStablePools) {
            symbols = await api.multiCall({ abi: 'erc20:symbol', calls, })
            cache.symbols.push(...symbols)
        }

        cache.pairs.push(...calls)
        cache.token0s.push(...token0s)
        cache.token1s.push(...token1s)

        updateCache = updateCache || cache.pairs.length > _oldPairInfoLength

        if (updateCache)
            await setCache(cacheFolder, key, cache)

        if (cache.pairs.length > length)
            cache.pairs = cache.pairs.slice(0, length)

        let reserves = []
        if (queryBatched) {
            const batchedCalls = sliceIntoChunks(cache.pairs, queryBatched)
            for (const calls of batchedCalls) {
                reserves.push(...await api.multiCall({ abi: abi.getReserves, calls }))
                if (waitBetweenCalls) await sleep(waitBetweenCalls)
            }
        } else if (fetchBalances) {
            const calls = []
            cache.pairs.forEach((owner, i) => {
                calls.push({ target: cache.token0s[i], params: owner })
                calls.push({ target: cache.token1s[i], params: owner })
            })
            const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls, })
            for (let i = 0; i < bals.length; i++) {
                reserves.push({ _reserve0: bals[i], _reserve1: bals[i + 1] })
                i++
            }
        } else
            reserves = await api.multiCall({ abi: abi.getReserves, calls: cache.pairs })


        const balances = {}
        if (coreAssets) {
            const data = []
            reserves.forEach(({ _reserve0, _reserve1 }, i) => {
                if (hasStablePools && cache.symbols[i].startsWith(stablePoolSymbol)) {
                    sdk.log('found stable pool: ', stablePoolSymbol)
                    sdk.util.sumSingleBalance(balances, cache.token0s[i], _reserve0)
                    sdk.util.sumSingleBalance(balances, cache.token1s[i], _reserve1)
                } else {
                    data.push({
                        token0: cache.token0s[i],
                        token1: cache.token1s[i],
                        token1Bal: _reserve1,
                        token0Bal: _reserve0,
                    })
                }
            })
            Object.keys(balances).forEach(key => {
                const decimals = usdcEquivalence[key]?.decimals;
                if (decimals) {
                    balances[usdcAddress] = BigNumber.from(balances[usdcAddress]).add(BigNumber.from(balances[key]).div(BigNumber.from(10).pow(decimals)).mul(BigNumber.from(10).pow(usdcDecimals))).toString()
                }
            });
            return transformDexBalances({ balances, chain, data, coreAssets, blacklistedTokens: blacklist })
        }

        const blacklistedSet = new Set(blacklist)
        reserves.forEach(({ _reserve0, _reserve1 }, i) => {
            if (!blacklistedSet.has(cache.token0s[i].toLowerCase())) sdk.util.sumSingleBalance(balances, cache.token0s[i], _reserve0)
            if (!blacklistedSet.has(cache.token1s[i].toLowerCase())) sdk.util.sumSingleBalance(balances, cache.token1s[i], _reserve1)
        })

        return transformBalances(chain, balances)
    }

    async function _getCache(cacheFolder, key, api) {
        let cache = await getCache(cacheFolder, key)
        if (cache.pairs) {
            for (let i = 0; i < cache.pairs.length; i++) {
                if (!cache.pairs[i]) {
                    cache.pairs[i] = await api.call({ abi: abi.allPairsLength, target: factory, params: i })
                    updateCache = true
                }
                let pair = cache.pairs[i]
                if (!cache.token0s[i]) {
                    cache.token0s[i] = await api.call({ abi: abi.token0, target: pair })
                    updateCache = true
                }
                if (!cache.token1s[i]) {
                    cache.token1s[i] = await api.call({ abi: abi.token1, target: pair })
                    updateCache = true
                }
            }
            // if (cache.pairs.includes(null) || cache.token0s.includes(null) || cache.token1s.includes(null))
            //   cache.pairs = undefined
        }

        if (!cache.pairs || (hasStablePools && (!cache.symbols || !cache.symbols.length))) {
            cache = {
                pairs: [],
                token0s: [],
                token1s: [],
                symbols: [],
            }
        }
        return cache
    }
}

module.exports = {
    getUniTVL
}
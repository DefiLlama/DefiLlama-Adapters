const sdk = require("@defillama/sdk")
const abi = require('./abi')
const chain = 'klaytn'
const { getUniqueAddresses, DEBUG_MODE, log } = require('../helper/utils')
const { requery, } = require('../helper/getUsdUniTvl')
const { default: BigNumber } = require('bignumber.js')
const { getChainTransform, stripTokenHeader, getFixBalances, } = require('../helper/portedTokens')

let totalTvl


const contract = '0x7886eFbA097A7187f7AeC12913B54BbC9F258faC'
const wklay = '0xe4f05a66ec68b54a58b17c22107b02e0232cc817'

async function getLPList(lps, chain, block, strats) {
    const callArgs = strats.map(t => ({ target: t, params: [] }))
    const poolTypes = []
    for (let i = 0; i < strats.length; i++) {
        const { output: poolType } = await sdk.api.abi.call({
            target: strats[i],
            abi: abi.poolType,
            chain, block,
        })
        poolTypes.push(poolType)
    }
    return lps.filter((item, index) => poolTypes[index] === '0' && index > 2)
    // log(symbols.filter(item => item.output !== 'Cake-LP').map(i => `token: ${i.input.target} Symbol: ${i.output}`).join('\n'))
}

async function getLPData2({
    block,
    chain = 'ethereum',
    lps = [], // list of token addresses (all need not be LPs, code checks and filters out non LPs)
    strats = [],
    allLps = false,   // if set true, assumes all tokens provided as lps are lps and skips validation/filtering

}) {
    lps = getUniqueAddresses(lps)
    const pairAddresses = allLps ? lps : await getLPList(lps, chain, block, strats)
    const pairCalls = pairAddresses.map((pairAddress) => ({ target: pairAddress.toLowerCase(), }))
    let token0Addresses, token1Addresses, reserves
    [token0Addresses, token1Addresses, reserves] = await Promise.all([
        sdk.api.abi.multiCall({ abi: abi.tokenA, chain, calls: pairCalls, block, }).then(({ output }) => output),
        sdk.api.abi.multiCall({ abi: abi.tokenB, chain, calls: pairCalls, block, }).then(({ output }) => output),
    ]);
    await requery(token0Addresses, chain, block, abi.tokenA);
    await requery(token1Addresses, chain, block, abi.tokenB);
    const pairs = {};
    token0Addresses.forEach((token0Address) =>
        pairs[token0Address.input.target] = {
            token0Address: token0Address.output.toLowerCase(),
        }
    )
    token1Addresses.forEach((token1Address) => {
        if (!pairs[token1Address.input.target]) pairs[token1Address.input.target] = {}
        pairs[token1Address.input.target].token1Address = token1Address.output.toLowerCase()
    })
    return pairs


}

async function getTokenPrices({
    block,
    chain = 'ethereum',
    abis = {},  // if some protocol uses custom abi instead of standard one
    useDefaultCoreAssets = false,  // use pre-defined list
    coreAssets = [],  // list of tokens that can used as base token to price unknown tokens against (Note: order matters, is there are two LPs for a token, the core asset with a lower index is used)
    blacklist = [],   // list of tokens to ignore/blacklist
    whitelist = [],   // if set, tvl/price is computed only for these tokens
    lps = [], // list of token addresses (all need not be LPs, code checks and filters out non LPs)
    transformAddress, // function for transforming token address to coingecko friendly format
    allLps = false,   // if set true, assumes all tokens provided as lps are lps and skips validation/filtering
    minLPRatio = 0.5, // if a token pool has less that this percent of core asset tokens compared to a token pool with max tokens for a given core asset, this token pool is not used for price calculation
    restrictTokenRatio = 10, // while computing tvl, an unknown token value can max be x times the pool value, default 100 times pool value
    log_coreAssetPrices = [],
    log_minTokenValue = 1e6 // log only if token value is higer than this value, now minimum is set as 1 million
}) {
    let counter = 0
    if (!transformAddress)
        transformAddress = await getChainTransform(chain)

    if (!coreAssets.length && useDefaultCoreAssets)
        coreAssets = getCoreAssets(chain)

    coreAssets = coreAssets.map(i => i.toLowerCase())
    blacklist = blacklist.map(i => i.toLowerCase())
    whitelist = whitelist.map(i => i.toLowerCase())
    lps = getUniqueAddresses(lps)
    const pairAddresses = allLps ? lps : await getLPList(lps, chain, block)
    const pairCalls = pairAddresses.map((pairAddress) => ({ target: pairAddress, }))

    let token0Addresses, token1Addresses, reserves
    [token0Addresses, token1Addresses, reserves] = await Promise.all([
        sdk.api.abi.multiCall({ abi: abi.tokenA, chain, calls: pairCalls, block, }).then(({ output }) => output),
        sdk.api.abi.multiCall({ abi: abi.tokenB, chain, calls: pairCalls, block, }).then(({ output }) => output),
        sdk.api.abi.multiCall({ abi: abi.getCurrentPool, chain, calls: pairCalls, block, }).then(({ output }) => output),
    ]);
    await requery(token0Addresses, chain, block, abi.tokenA);
    await requery(token1Addresses, chain, block, abi.tokenB);
    await requery(reserves, chain, block, abi.getCurrentPool);


    const pairs = {};
    // add token0Addresses
    token0Addresses.forEach((token0Address) => {
        const tokenAddress = token0Address.output.toLowerCase();

        const pairAddress = token0Address.input.target.toLowerCase();
        pairs[pairAddress] = {
            token0Address: tokenAddress,
        }
    });

    // add token1Addresses
    token1Addresses.forEach((token1Address) => {
        const tokenAddress = token1Address.output.toLowerCase();
        const pairAddress = token1Address.input.target.toLowerCase();
        pairs[pairAddress] = {
            ...(pairs[pairAddress] || {}),
            token1Address: tokenAddress,
        }
    });

    const prices = {}
    const pairBalances = {}
    for (let i = 0; i < reserves.length; i++) {
        const pairAddress = reserves[i].input.target.toLowerCase();
        const pair = pairs[pairAddress];
        pairBalances[pairAddress] = {}
        const token0Address = pair.token0Address.toLowerCase()
        const token1Address = pair.token1Address.toLowerCase()
        const reserveAmounts = reserves[i].output
        if (coreAssets.includes(token0Address) && coreAssets.includes(token1Address)) {
            sdk.util.sumSingleBalance(pairBalances[pairAddress], token0Address, Number(reserveAmounts[0]))
            sdk.util.sumSingleBalance(pairBalances[pairAddress], token1Address, Number(reserveAmounts[1]))
        } else if (coreAssets.includes(token0Address)) {
            sdk.util.sumSingleBalance(pairBalances[pairAddress], token0Address, Number(reserveAmounts[0]) * 2)
            if (!blacklist.includes(token1Address) && (!whitelist.length || whitelist.includes(token1Address))) {
                setPrice(prices, token1Address, reserveAmounts[0], reserveAmounts[1], token0Address)
            }
        } else if (coreAssets.includes(token1Address)) {
            if (!reserveAmounts) log('missing reserves', pairAddress)
            sdk.util.sumSingleBalance(pairBalances[pairAddress], token1Address, Number(reserveAmounts[1]) * 2)
            if (!blacklist.includes(token0Address) && (!whitelist.length || whitelist.includes(token0Address))) {
                setPrice(prices, token0Address, reserveAmounts[1], reserveAmounts[0], token1Address)
            }
        } else {
            const isWhitelistedToken0 = !blacklist.includes(token0Address)
            const isWhitelistedToken1 = !blacklist.includes(token1Address)
            if (isWhitelistedToken0 && isWhitelistedToken1) {
                sdk.util.sumSingleBalance(pairBalances[pairAddress], token0Address, Number(reserveAmounts[0]))
                sdk.util.sumSingleBalance(pairBalances[pairAddress], token1Address, Number(reserveAmounts[1]))
            } else if (isWhitelistedToken0) {
                sdk.util.sumSingleBalance(pairBalances[pairAddress], token0Address, Number(reserveAmounts[0]) * 2)
            } else if (isWhitelistedToken1) {
                sdk.util.sumSingleBalance(pairBalances[pairAddress], token1Address, Number(reserveAmounts[1]) * 2)
            }
        }
    }

    // set price of tokens that are not directly paired against core assets but with tokens that are paired against core tokens

    for (let i = 0; i < reserves.length; i++) {
        const pairAddress = reserves[i].input.target.toLowerCase();
        const pair = pairs[pairAddress];
        const token0Address = pair.token0Address.toLowerCase()
        const token1Address = pair.token1Address.toLowerCase()
        const reserveAmounts = reserves[i].output
        if ((coreAssets.includes(token0Address) && coreAssets.includes(token1Address))
            || coreAssets.includes(token0Address)
            || coreAssets.includes(token1Address)
        ) { // ignore these cases as tokens are already taken care of here
        } else {
            const isWhitelistedToken0 = !blacklist.includes(token0Address)
            const isWhitelistedToken1 = !blacklist.includes(token1Address)
            if (isWhitelistedToken0 && prices[token0Address] && !prices[token1Address]) {
                pairBalances[pairAddress] = {}
                const [coreTokenAmountInLP, tokenPrice, coreAsset,] = prices[token0Address]
                const newCoreAmount = coreTokenAmountInLP * tokenPrice / 10 // we are diluting the amount of core tokens intentionally
                const newTokenAmount = reserveAmounts[1] / 10 // also divided by 10 to keep price steady
                // setPrice(prices, token1Address, newCoreAmount, newTokenAmount, coreAsset)
                sdk.util.sumSingleBalance(pairBalances[pairAddress], token0Address, Number(reserveAmounts[0]) * 2)
            } else if (isWhitelistedToken1 && prices[token1Address] && !prices[token0Address]) {
                pairBalances[pairAddress] = {}
                const [coreTokenAmountInLP, tokenPrice, coreAsset,] = prices[token1Address]
                const newCoreAmount = coreTokenAmountInLP * tokenPrice / 10 // we are diluting the amount of core tokens intentionally
                const newTokenAmount = reserveAmounts[0] / 10 // also divided by 10 to keep price steady
                // setPrice(prices, token0Address, newCoreAmount, newTokenAmount, coreAsset)
                sdk.util.sumSingleBalance(pairBalances[pairAddress], token1Address, Number(reserveAmounts[1]) * 2)
            }
        }
    }

    filterPrices(prices)
    const balances = {}
    Object.keys(pairBalances).forEach(key => addBalances(pairBalances[key], balances, { pairAddress: key }))
    const fixBalances = await getFixBalances(chain)
    fixBalances(balances)

    return {
        pairs,
        updateBalances,
        pairBalances,
        prices,
        balances,
    }

    function setPrice(prices, address, coreAmount, tokenAmount, coreAsset) {
        if (prices[address] !== undefined) {
            const currentCoreAmount = prices[address][0]
            const currentCoreAsset = prices[address][2]
            // core asset higher on the list has higher preference
            if (coreAssets.indexOf(currentCoreAmount) < coreAssets.indexOf(coreAsset)) return;
            if ((currentCoreAsset === coreAsset) && coreAmount < currentCoreAmount) return;
        }
        if (Number(tokenAmount) > 0)
            prices[address] = [Number(coreAmount), Number(coreAmount) / Number(tokenAmount), coreAsset, +Number(tokenAmount)]
    }

    function getAssetPrice(asset) {
        const assetIndex = coreAssets.indexOf(asset.toLowerCase())
        if (assetIndex === -1 || !log_coreAssetPrices[assetIndex]) return 1 / 1e18
        return log_coreAssetPrices[assetIndex]
    }

    async function updateBalances(balances, { resolveLP = true, skipConversion = false, onlyLPs = false, } = {}) {
        let lpAddresses = []  // if some of the tokens in balances are LP tokens, we resolve those as well
        log('---updating balances-----')
        const finalBalances = onlyLPs ? {} : balances
        counter = 0
        Object.entries(balances).forEach(([address, amount = 0]) => {
            const token = stripTokenHeader(address)
            const price = prices[token];
            if (pairBalances[token]) {
                lpAddresses.push(token)
                return;
            }
            if (!price || skipConversion) return;
            let tokenAmount = price[1] * +amount
            const coreAsset = price[2]
            const tokensInLP = price[3]
            const coreTokenAmountInLP = price[0]
            const maxAllowedAmount = coreTokenAmountInLP * restrictTokenRatio
            // if (DEBUG_MODE && tokenAmount * getAssetPrice(coreAsset) > log_minTokenValue)
            //   log(`[converting balances] token vaule (in millions): ${(tokenAmount * getAssetPrice(coreAsset) / 1e6).toFixed(4)}, token value higher than pool: ${+amount > +tokensInLP} token: ${token} counter: ${++counter}`)

            if (tokenAmount > maxAllowedAmount) {// use token amount in pool if balances amount is higher than amount in pool
                log(`[converting balances]  Value to LP ratio: ${tokenAmount / tokensInLP} token: ${token} counter: ${++counter}`)
                sdk.util.sumSingleBalance(balances, transformAddress(coreAsset), BigNumber(maxAllowedAmount).toFixed(0))
                balances[address] = BigNumber((tokenAmount - maxAllowedAmount) / price[1]).toFixed(0)
            } else {
                sdk.util.sumSingleBalance(balances, transformAddress(coreAsset), BigNumber(tokenAmount).toFixed(0))
                delete balances[address]
            }
        })

        if (!resolveLP) return balances

        if (lpAddresses.length) {
            const totalBalances = (await sdk.api.abi.multiCall({
                abi: 'erc20:totalSupply', calls: lpAddresses.map(i => ({ target: i })), block, chain
            })).output

            totalBalances.forEach((item) => {
                const token = item.input.target
                const address = transformAddress(token)
                const ratio = +item.output > 0 ? (+(balances[address]) || 0) / +item.output : 0
                addBalances(pairBalances[token], finalBalances, { ratio, pairAddress: token, skipConversion, })
                delete balances[address]
            })
        }

        return finalBalances
    }


    function addBalances(balances, finalBalances, { skipConversion = false, pairAddress, ratio = 1 }) {
        if (ratio > 1) {
            console.log(`There is bug in the code. Pair address: ${pairAddress}, ratio: ${ratio}`)
            ratio = 1
        }
        Object.entries(balances).forEach(([address, amount = 0]) => {
            const price = prices[address];
            // const price =  undefined; // NOTE: this is disabled till, we add a safeguard to limit LP manipulation to inflate token price, like mimimum core asset liquidity to be 10k
            if (price && !skipConversion) {
                const coreTokenAmountInLP = price[0]
                const coreAsset = price[2]
                const tokensInLP = price[3]
                let tokenAmount = price[1] * +amount
                const maxAllowedAmount = coreTokenAmountInLP * restrictTokenRatio
                // if (DEBUG_MODE && tokenAmount * getAssetPrice(coreAsset) * ratio > log_minTokenValue)
                //   console.log(`[resolve LP balance] token vaule (in millions): ${(tokenAmount * getAssetPrice(coreAsset) * ratio / 1e6).toFixed(4)}, token value higher than pool: ${+amount > +tokensInLP} LP Address: ${pairAddress} token: ${address} ratio: ${ratio} counter: ${++counter}`)

                if (tokenAmount > maxAllowedAmount) {// use token amount in pool if balances amount is higher than amount in pool
                    log(`[converting balances]  Value to LP ratio: ${tokenAmount / tokensInLP} LP Address: ${pairAddress} ratio: ${ratio} token: ${address} counter: ${++counter}`)
                    sdk.util.sumSingleBalance(balances, transformAddress(coreAsset), BigNumber(maxAllowedAmount * ratio).toFixed(0))
                } else {
                    sdk.util.sumSingleBalance(balances, transformAddress(coreAsset), BigNumber(tokenAmount * ratio).toFixed(0))
                }
            } else {
                if ((DEBUG_MODE && coreAssets.includes(address)) && (+amount * getAssetPrice(address) * ratio > log_minTokenValue))
                    console.log(`[resolve LP balance] token vaule (in millions): ${(+amount * getAssetPrice(address) * ratio / 1e6).toFixed(4)}, LP Address: ${pairAddress}  core token: ${address} ratio: ${ratio} counter: ${++counter}`)
                sdk.util.sumSingleBalance(finalBalances, transformAddress(address), BigNumber(+amount * ratio).toFixed(0))
            }
        })
    }

    // If we fetch prices from pools with low liquidity, the value of tokens can be absurdly high, so we set a threshold that if we are using a core asset to determine price,
    // the amount of said core asset in a pool from which price is fetched must be at least 0.5% of the amount of core asset tokens in pool with highest core asset tokens
    function filterPrices(prices) {
        const maxCoreTokens = {}
        Object.values(prices).forEach(([amount, _, coreAsset]) => {
            if (!maxCoreTokens[coreAsset] || maxCoreTokens[coreAsset] < +amount)
                maxCoreTokens[coreAsset] = +amount
        })

        Object.keys(prices).forEach(token => {
            const priceArry = prices[token]
            const [amount, _, coreAsset] = priceArry
            if (!maxCoreTokens[coreAsset]) throw new Error('there is bug in the code')
            const lpRatio = +amount * 100 / maxCoreTokens[coreAsset]
            if (lpRatio < minLPRatio) delete prices[token] // current pool has less than 0.5% of tokens compared to pool with highest number of core tokens
        })
    }
}


async function gettotalTvl(block) {
    if (!totalTvl) totalTvl = getTVL()
    return totalTvl

    async function getTVL() {
        const transform = await getChainTransform(chain)
        const balances = {
            tvl: {},
            pool2: {},
            staking: {},
        }
        const { output: length } = await sdk.api.abi.call({
            target: contract,
            abi: abi.poolLength,
            chain, block,
        })

        const calls = []
        for (let i = 0; i < length; i++) calls.push({ params: [i] })
        const { output: data } = await sdk.api.abi.multiCall({
            target: contract,
            abi: abi.poolInfo2,
            calls,
            chain, block,
        })




        const tempBalances = {}
        const lps = []
        const strats = []

        data.forEach(({ output }) => {
            const token = output.lpToken.toLowerCase()
            const amount = output.amount0
            sdk.util.sumSingleBalance(tempBalances, token, amount)
            lps.push(token)
            strats.push(output.strat0)
        })

        const pairs = await getLPData2({ lps, chain, block, strats })
        const { updateBalances, } = await getTokenPrices({ lps: Object.keys(pairs), allLps: true, coreAssets: [], block, chain, minLPRatio: 0.001 })


        Object.entries(tempBalances).forEach(([token, balance]) => {
            if (token.toLowerCase() === wklay.toLowerCase()) {
                sdk.util.sumSingleBalance(balances.tvl, `${chain}:${token.toLowerCase()}`, balance)
            } else {
                sdk.util.sumSingleBalance(balances.tvl, transform(token), balance)

            }


        })

        await updateBalances(balances.tvl)
        await updateBalances(balances.pool2)

        return balances
    }
}

async function tvl(_, _b, { [chain]: block }) {
    return (await gettotalTvl(block)).tvl
}

async function pool2(_, _b, { [chain]: block }) {
    return (await gettotalTvl(block)).pool2
}

async function staking(_, _b, { [chain]: block }) {
    return (await gettotalTvl(block)).staking
}



module.exports = {
    klaytn: {
        tvl, pool2, staking,
    }
}
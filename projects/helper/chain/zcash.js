const sdk = require('@defillama/sdk')
const { post } = require('../http')
const { getEnv } = require('../env')
const { getUniqueAddresses } = require('../tokenMapping')
const { RateLimiter } = require("limiter");
const { sliceIntoChunks, sleep } = require('../utils');

const delay = 60 * 60 // 1 hour
const balancesNow = {}

const zcashCacheEnv = getEnv('ZCASH_CACHE_API')

const limiter = new RateLimiter({ tokensPerInterval: 1, interval: 10_000 });

async function cachedZECBalCall(owners, retriesLeft = 2) {
    const res = await post(zcashCacheEnv, { addresses: owners, network: 'ZEC' })
    return res
}

async function getCachedZcashBalances(owners) {
    const chunks = sliceIntoChunks(owners, 700)
    sdk.log('zcash cache api call: ', owners.length, chunks.length)
    let sum = 0
    let i = 0
    for (const chunk of chunks) {
        const res = await cachedZECBalCall(chunk)
        sdk.log(i++, sum / 1e8, res / 1e8, chunk.length)
        sum += +res
    }
    return sum
}

async function _sumTokensBlockchain({ balances = {}, owners = [], forceCacheUse, }) {
    if (zcashCacheEnv && owners.length > 51) {
        if (owners.length > 1000) forceCacheUse = true
        const res = await getCachedZcashBalances(owners)
        sdk.util.sumSingleBalance(balances, 'zcash', res / 1e8)
        return balances
    }

    throw new Error('ZCASH_CACHE_API environment variable not configured')
}

const withLimiter = (fn, tokensToRemove = 1) => async (...args) => {
    await limiter.removeTokens(tokensToRemove);
    return fn(...args);
}

const sumTokensBlockchain = withLimiter(_sumTokensBlockchain)

async function sumTokens({ balances = {}, owners = [], timestamp, forceCacheUse, }) {
    if (typeof timestamp === "object" && timestamp.timestamp) timestamp = timestamp.timestamp
    owners = getUniqueAddresses(owners, 'zcash')
    const now = Date.now() / 1e3

    if (!timestamp || (now - timestamp) < delay) {
        await sumTokensBlockchain({ balances, owners, forceCacheUse })
        return balances
    }

    throw new Error('timestamp is too old, cant pull with forceCacheUse flag set')
}

module.exports = {
    sumTokens
}


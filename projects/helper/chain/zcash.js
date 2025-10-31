const sdk = require('@defillama/sdk')
const { get, post } = require('../http')
const { getEnv } = require('../env')
const { getUniqueAddresses } = require('../tokenMapping')
const { RateLimiter } = require("limiter");
const { sliceIntoChunks, sleep } = require('../utils');

// Zcash block explorer API endpoints
const url = addr => 'https://api.zcha.in/v2/mainnet/accounts/' + addr
const url2 = addr => 'https://api.zcashnetwork.io/api/v1/addresses/' + addr + '/balance'

const delay = 3 * 60 * 60 // 3 hours
const balancesNow = {}

const zcashCacheEnv = getEnv('ZCASH_CACHE_API')

const limiter = new RateLimiter({ tokensPerInterval: 1, interval: 10_000 });

async function cachedZECBalCall(owners, retriesLeft = 2) {
    try {
        const res = await post(zcashCacheEnv, { addresses: owners, network: 'ZEC' })
        return res
    } catch (e) {
        console.error('cachedZECBalCall error', e.toString())
        if (retriesLeft > 0) {
            return await cachedZECBalCall(owners, retriesLeft - 1)
        }
        throw e
    }
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
        try {
            const res = await getCachedZcashBalances(owners)
            sdk.util.sumSingleBalance(balances, 'zcash', res / 1e8)
            return balances

        } catch (e) {
            if (forceCacheUse) throw e
            sdk.log('zcash cache error', e.toString())
        }
    }
    console.time('zcash' + owners.length + '___' + owners[0])
    const STEP = 10 // Smaller batches for Zcash API
    for (let i = 0; i < owners.length; i += STEP) {
        const chunk = owners.slice(i, i + STEP)
        // Query addresses individually since batch APIs aren't reliable
        for (const addr of chunk) {
            try {
                const balance = await getBalanceNow(addr)
                sdk.util.sumSingleBalance(balances, 'zcash', balance)
            } catch (err) {
                sdk.log('zcash balance error', addr, err.toString())
            }
        }
        await sleep(2000) // Rate limiting
    }

    console.timeEnd('zcash' + owners.length + '___' + owners[0])
    return balances
}

const withLimiter = (fn, tokensToRemove = 1) => async (...args) => {
    await limiter.removeTokens(tokensToRemove);
    return fn(...args);
}

const sumTokensBlockchain = withLimiter(_sumTokensBlockchain)

async function getBalanceNow(addr) {
    if (balancesNow[addr]) return balancesNow[addr]
    try {
        // Try zcha.in API first - returns balance in Zatoshi (smallest unit, like satoshis)
        const response = await get(url(addr))
        if (response && (response.balance !== undefined || response.balance !== null)) {
            balancesNow[addr] = (response.balance || 0) / 1e8
            return balancesNow[addr]
        }
    } catch (e) {
        sdk.log('zcha.in zcash balance error', addr, e.toString())
    }

    try {
        // Fallback to zcashnetwork.io API
        const response = await get(url2(addr))
        if (response && (response.balance !== undefined || response.balance !== null)) {
            balancesNow[addr] = (response.balance || 0) / 1e8
            return balancesNow[addr]
        }
    } catch (e) {
        sdk.log('zcashnetwork.io balance error', addr, e.toString())
    }

    // Default to 0 if no balance found
    balancesNow[addr] = 0
    return balancesNow[addr]
}

async function sumTokens({ balances = {}, owners = [], timestamp, forceCacheUse, }) {
    if (typeof timestamp === "object" && timestamp.timestamp) timestamp = timestamp.timestamp
    owners = getUniqueAddresses(owners, 'zcash')
    const now = Date.now() / 1e3

    if (!timestamp || (now - timestamp) < delay) {
        try {
            await sumTokensBlockchain({ balances, owners, forceCacheUse })
            return balances
        } catch (e) {
            sdk.log('zcash sumTokens error', e.toString())
        }
    }
    if (forceCacheUse) throw new Error('timestamp is too old, cant pull with forceCacheUse flag set')

    for (const addr of owners)
        sdk.util.sumSingleBalance(balances, 'zcash', await getBalance(addr, timestamp))
    return balances
}

// get archive ZEC balance
async function getBalance(addr, timestamp) {
    try {
        const endpoint = url(addr) + '/transactions'
        const response = await get(endpoint)
        const txs = response.data?.[addr]?.transactions || []

        let balance = 0
        for (const tx of txs) {
            if (tx.time && tx.time <= timestamp) {
                // Process outputs (received)
                if (tx.outputs) {
                    for (const output of tx.outputs) {
                        if (output.recipient === addr) {
                            balance += (output.value || 0) / 1e8
                        }
                    }
                }
                // Process inputs (spent)
                if (tx.inputs) {
                    for (const input of tx.inputs) {
                        if (input.recipient === addr) {
                            balance -= (input.value || 0) / 1e8
                        }
                    }
                }
            }
        }

        return balance
    } catch (e) {
        sdk.log('zcash getBalance error', addr, e.toString())
        // Fallback to current balance if historical lookup fails
        return await getBalanceNow(addr)
    }
}

module.exports = {
    sumTokens
}


const { getMultipleAccountBuffers } = require('./helper/solana')

async function sunnySaberPoolTVL(pool) {
    const accountData = await getMultipleAccountBuffers(pool.relevantAccounts)

    const lpTokensInSunnyPool = Number(accountData.sunnyPool.readBigInt64LE(209)) / 1000000
    const reserveAAmount = Number(accountData.tokenAReserve.readBigInt64LE(64)) / 1000000
    const reserveBAmount = Number(accountData.tokenBReserve.readBigInt64LE(64)) / 1000000
    const poolTokenSPL = Number(accountData.poolTokenSPL.readBigInt64LE(36)) / 1000000

    const sunnysShareOfSaber = lpTokensInSunnyPool / poolTokenSPL

    const poolTvlCoins = {}
    poolTvlCoins[pool.tokenA] = sunnysShareOfSaber * reserveAAmount
    poolTvlCoins[pool.tokenB] = sunnysShareOfSaber * reserveBAmount

    return poolTvlCoins
}

async function tvl() {
    const pools = [{
        poolName: "saber_usdc_usdt",
        relevantAccounts: {
            sunnyPool: "DgCMFSzZzZBnyFTmEiX1zfsugckBLyyX79YUgZr9XCf7",
            tokenAReserve: "CfWX7o2TswwbxusJ4hCaPobu2jLCb1hfXuXJQjVq3jQF",
            tokenBReserve: "EnTrdMMpdhugeH6Ban6gYZWXughWxKtVGfCwFn78ZmY3",
            poolTokenSPL: "2poo1w1DL6yd2WNTCnNTzDqkC6MBXq7axo77P16yrBuf",
        },
        tokenA: "usd-coin",
        tokenB: "tether",
        tvlParser: sunnySaberPoolTVL,
    }]

    // a mapping of coin name to coin amount
    const tvlResult = {}

    // Run these serially to avoid rate limiting issues
    for (const pool of pools) {
        const poolTVL = await pool.tvlParser(pool)
        console.log(pool.poolName, poolTVL)

        for (const [tokenId, amount] of Object.entries(poolTVL)) {
            if (!tvlResult[tokenId]) {
                tvlResult[tokenId] = amount
            } else {
                tvlResult[tokenId] += amount
            }
        }
    }

    return tvlResult
}

module.exports = {
    tvl,
}

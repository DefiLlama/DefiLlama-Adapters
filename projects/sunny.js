const { getMultipleAccountBuffers } = require('./helper/solana')

async function sunnySaberPoolReader(pool) {
    const accountData = await getMultipleAccountBuffers(pool.relevantAccounts)

    const lpTokensInSunnyPool = Number(accountData.sunnyPool.readBigInt64LE(209)) / 10 ** pool.decimals
    const reserveAAmount = Number(accountData.tokenAReserve.readBigInt64LE(64)) / 10 ** pool.decimals
    const reserveBAmount = Number(accountData.tokenBReserve.readBigInt64LE(64)) / 10 ** pool.decimals
    const lpTokenTotalSupply = Number(accountData.lpTokenSPL.readBigInt64LE(36)) / 10 ** pool.decimals

    const sunnysShareOfSaber = lpTokensInSunnyPool / lpTokenTotalSupply

    const poolTvlCoins = {}

    if (pool.tokenA === pool.tokenB) {
        poolTvlCoins[pool.tokenA] = sunnysShareOfSaber * reserveAAmount + sunnysShareOfSaber * reserveBAmount
    } else {
        poolTvlCoins[pool.tokenA] = sunnysShareOfSaber * reserveAAmount
        poolTvlCoins[pool.tokenB] = sunnysShareOfSaber * reserveBAmount
    }

    return poolTvlCoins
}

async function tvl() {
    const pools = [
        {
            poolName: "Saber_USDT-USDC",
            relevantAccounts: {
                sunnyPool: "DgCMFSzZzZBnyFTmEiX1zfsugckBLyyX79YUgZr9XCf7",
                tokenAReserve: "CfWX7o2TswwbxusJ4hCaPobu2jLCb1hfXuXJQjVq3jQF",
                tokenBReserve: "EnTrdMMpdhugeH6Ban6gYZWXughWxKtVGfCwFn78ZmY3",
                lpTokenSPL: "2poo1w1DL6yd2WNTCnNTzDqkC6MBXq7axo77P16yrBuf"
            },
            tokenA: "usd-coin",
            tokenB: "tether",
            decimals: 6,
            tvlReader: sunnySaberPoolReader
        },
        {
            poolName: "Saber_mSOL-SOL",
            relevantAccounts: {
                sunnyPool: "F8Tguj5VBWCrYzUPztETok5X78LR7djdrMtaorYhawgw",
                tokenAReserve: "9DgFSWkPDGijNKcLGbr3p5xoJbHsPgXUTr6QvGBJ5vGN",
                tokenBReserve: "2hNHZg7XBhuhHVZ3JDEi4buq2fPQwuWBdQ9xkH7t1GQX",
                lpTokenSPL: "SoLEao8wTzSfqhuou8rcYsVoLjthVmiXuEjzdNPMnCz"
            },
            tokenA: "solana",
            tokenB: "solana",
            decimals: 9,
            tvlReader: sunnySaberPoolReader
        },
        {
            poolName: "Saber_PAI-USDC",
            relevantAccounts: {
                sunnyPool: "GHhWVFF4kPvvz7qxtTi6uTr6nDoC1Ho7ZrKYTNZirVRj",
                tokenAReserve: "4DYwgJtxwuJdAjkj5RJSNH4e7U329V5cNp7d3a1nLrZv",
                tokenBReserve: "EXNW64GEf1ACC6xY9BtKRiunrs6GoJSXBdxWN2eTPmrF",
                lpTokenSPL: "PaiYwHYxr4SsEWox9YmyBNJmxVG7GdauirbBcYGB7cJ"
            },
            tokenA: "dai", // Parrot's PAI
            tokenB: "usd-coin",
            decimals: 6,
            tvlReader: sunnySaberPoolReader
        },
        {
            poolName: "Saber_BTC-renBTC",
            relevantAccounts: {
                sunnyPool: "22NmJEkjSUzvtagiau2JEwXdo9pc9UgZJX1BZiRJimaH",
                tokenAReserve: "35yX27bmurdebhfAb8EPmjLETDiUaEUCn9zHaDPbakH2",
                tokenBReserve: "2CxECn1ZJFoESyUnQysQU8rRgT3iJ5GRs2Mdd6gZjx5g",
                lpTokenSPL: "SLPbsNrLHv8xG4cTc4R5Ci8kB9wUPs6yn6f7cKosoxs"
            },
            tokenA: "renbtc",
            tokenB: "bitcoin",
            decimals: 8,
            tvlReader: sunnySaberPoolReader
        },
        {
            poolName: "Saber_pBTC-renBTC",
            relevantAccounts: {
                sunnyPool: "EGig51WPpRrVknLmZYiTfba93w31sGCFMApRzHcAwmKr",
                tokenAReserve: "DvHVapj4g2Y1tJVSw2ubSPkPBsJPb8fW387ZWXwaKmZq",
                tokenBReserve: "DKjqWWgrtDRPKrnMWtZ4UiJk4sGQVCQgFjSo7BvfngvK",
                lpTokenSPL: "pBTCmyG7FaZx4uk3Q2pT5jHKWmWDn84npdc7gZXpQ1x"
            },
            tokenA: "renbtc",
            tokenB: "bitcoin",
            decimals: 8,
            tvlReader: sunnySaberPoolReader
        },
        {
            poolName: "Saber_UST-USDC",
            relevantAccounts: {
                sunnyPool: "CmV2Cppe7EoqhGvsMws3bFs5iStm5gmDmejJvaRT2uco",
                tokenAReserve: "D9yh4KAysxt9GLacVe4Wwh2XqghhcjTCSTV9HuM7TBJd",
                tokenBReserve: "HDYfJLpZKaMFb84jM4mRytn7XLR8UFZUnQpSfhJJaNEy",
                lpTokenSPL: "UST32f2JtPGocLzsL41B3VBBoJzTm1mK1j3rwyM3Wgc"
            },
            tokenA: "usd-coin",
            tokenB: "terrausd",
            decimals: 9,
            tvlReader: sunnySaberPoolReader
        },
        {
            poolName: "Saber_wDAI-USDC",
            relevantAccounts: {
                sunnyPool: "BtxevLdCyhHJhhMo1dvcXBvt5RB3FWSv4P6knkeTf6wT",
                tokenAReserve: "A7VkMFrnCCyeZFUrQ3TzDr4xFep7PZtxvy3jJnBjLB2a",
                tokenBReserve: "PhfHJ2Yu99BsEjZrefhApqUnLUiExcECcUT1YLoNUUv",
                lpTokenSPL: "Daimhb91DY4e3aVaa7YCW5GgwaMT9j1ALSi2GriBvDNh"
            },
            tokenA: "dai",
            tokenB: "usd-coin",
            decimals: 9,
            tvlReader: sunnySaberPoolReader
        },
        {
            poolName: "Saber_wBUSD-USDC",
            relevantAccounts: {
                sunnyPool: "HmW1eg5XhWTk7a42Vmd2SmHMeBxxphkcS6abAec6Pg1g",
                tokenAReserve: "5uerVwBnZQsuVhZ15igs7ZgmcqhHnYWbwoRtLyRqLvR",
                tokenBReserve: "9YWiQh5d4jCtgMdzcGLv9bWgnLaFtzvDDh2nnhJdzhBX",
                lpTokenSPL: "BUSDaZjarCrQJLeHpWi7aLaKptdR1S8DFpwdDuuZu9p3"
            },
            tokenA: "busd",
            tokenB: "usd-coin",
            decimals: 9,
            tvlReader: sunnySaberPoolReader
        },
        {
            poolName: "Saber_wLUNA-renLUNA",
            relevantAccounts: {
                sunnyPool: "4rDTvyrzLXYPHEweNnVLtEyCnMJ5UfMjAcsMSkfgECvF",
                tokenAReserve: "Au5zcSost9sXpH8AQQjULRXJ9QCJ3kdKehUr1zYzTr6G",
                tokenBReserve: "Gx1L7n1YhDWLNfUyCeZfzKvwHJSxhppnk4DS5cZLqyd",
                lpTokenSPL: "LUNkiLcb2wxcqULmJvMjuM6YQhpFBadG5KZBe7qBpSE"
            },
            tokenA: "terra-luna",
            tokenB: "terra-luna",
            decimals: 9,
            tvlReader: sunnySaberPoolReader
        },
        {
            poolName: "Saber_wFRAX-USDC",
            relevantAccounts: {
                sunnyPool: "oGS5V292ry3XwqDooaqnHgxedKNvEQ5mtrG3cYba2ah",
                tokenAReserve: "7eEYpq6ShaJ9opZWMxitRFrdCHh6vfyHhGfoSvFht3N2",
                tokenBReserve: "H8VggnHmuwd1wvwpT8eg9cUJFEfZ7HAaeYjgXrSm7A2u",
                lpTokenSPL: "FRAXXvt2ucEsxYPK4nufDy5zKhb2xysieqRBE1dQTqnK"
            },
            tokenA: "frax",
            tokenB: "usd-coin",
            decimals: 9,
            tvlReader: sunnySaberPoolReader
        },
        {
            poolName: "Saber_HBTC-renBTC",
            relevantAccounts: {
                sunnyPool: "7mzgsXmiqhwWybEnbDAWJdYff6PWRq4TB8voUWbe1gce",
                tokenAReserve: "GsizhiRtCs4QDKd2LnSQ9BpzvG8CqERMDtHZcQPDkFQB",
                tokenBReserve: "CRaJHfCry6JShmF4tMr6siR2D2QNNfcUrLawTqPVCTTJ",
                lpTokenSPL: "HBTCNvkwjMsEtwe2PeXUuMcu8C4Hobw6HDP2m6vpWHGo"
            },
            tokenA: "bitcoin",
            tokenB: "bitcoin",
            decimals: 9,
            tvlReader: sunnySaberPoolReader
        },
        {
            poolName: "Saber_HUSD-USDC",
            relevantAccounts: {
                sunnyPool: "MJj6148HLjiahjcv1b83NZ8j4YNCnKN5wJ8urMir5Vh",
                tokenAReserve: "2mUxDu8NrhSKhQJMgKfYLxJqZzeEbmwhQdHeHMyohyuk",
                tokenBReserve: "AZCBmDBcFsA2jHHhfFJBTsWCHx9XnnKmGfFsue3ZVW1t",
                lpTokenSPL: "HUSDgP5YieANhAAHD42yivX9aFS1zbodTut2Dvvkj8QS"
            },
            tokenA: "husd",
            tokenB: "usd-coin",
            decimals: 8,
            tvlReader: sunnySaberPoolReader
        },
        {
            poolName: "Saber_USDK-USDC",
            relevantAccounts: {
                sunnyPool: "6UaNyeYKzP7zzUwPN3SCQYRjE438akKTVa9VU7cSj5C9",
                tokenAReserve: "5RfXYWvxR9PUaedokXVxgJHDoD4xnLLauVtdJ27shPWG",
                tokenBReserve: "DJcFPaQjyW9Xkt7sXCbnEGj1yfykGYuLRUXFyS4LLZ5F",
                lpTokenSPL: "uSdKg2Cs5bCtFSeNXs7aRVNzZJauX58eCkdsfssxTdW"
            },
            tokenA: "usdk",
            tokenB: "usd-coin",
            decimals: 9,
            tvlReader: sunnySaberPoolReader
        },
        {
            poolName: "Saber_wFTT-FTT",
            relevantAccounts: {
                sunnyPool: "9qQVQfDFGqRw6HHvcZfHVTdJgqsgyLS6jY5LU38GkkP5",
                tokenAReserve: "46xwHtnXoQR3wCHUbm2eCAbPYWbioDQ59Te1Db8M5DDL",
                tokenBReserve: "FC38fiikZwFvDt5zTjNtGfKd7LjaPz2uUAzLwKP5pRJY",
                lpTokenSPL: "FTXdV5wFFhceKjcd1JRrRQTT2uB7ruMerAqbj2rj1Mz7"
            },
            tokenA: "ftx-token",
            tokenB: "ftx-token",
            decimals: 9,
            tvlReader: sunnySaberPoolReader
        },
        {
            poolName: "Saber_wSRM-SRM",
            relevantAccounts: {
                sunnyPool: "4Hn4AvnbQAsCytdPSmFJFtAzsVpGM3XaJsqNZo9TRgMG",
                tokenAReserve: "C5uYkVHiFduEFq8S3fr4pgUS24oYj1sjZ8WW2cb4j8SU",
                tokenBReserve: "3F5DPU5ScgHiFzePYUHZovvgh3uqmM5keNvbavx2ERqV",
                lpTokenSPL: "SRMKjSJpBHJ5gSVTrimci49SnXc1LVkBi9TGF9RNYdp"
            },
            tokenA: "serum",
            tokenB: "serum",
            decimals: 6,
            tvlReader: sunnySaberPoolReader
        },
        {
            poolName: "Saber_ibBTC-renBTC",
            relevantAccounts: {
                sunnyPool: "JCskJBoq3itLVHa6RF8mdDJ3htqh8q1APWKhisEYG29b",
                tokenAReserve: "CZ48nQQ6GK8Z7hGBPdxTtMzRBA8werj5iciVJnc3vz1S",
                tokenBReserve: "G3nLYyvP46npva5MEobZVJhcDNzJ4rrHgLGJMtvyad5c",
                lpTokenSPL: "BRENm9SgYJZuCxM4ZJiH6CmZqEBn4MLpD9cnBZDnJgeT"
            },
            tokenA: "bitcoin",
            tokenB: "bitcoin",
            decimals: 9,
            tvlReader: sunnySaberPoolReader
        },
        {
            poolName: "Saber_apUSDT-USDT",
            relevantAccounts: {
                sunnyPool: "7pQLXy3befFLSszHBkH9zpkhptEK6H8FEeEZRCXVTikS",
                tokenAReserve: "D6d156U1bPiJpDYRLextvDRccgFk7QzkQbJg42ceKEu5",
                tokenBReserve: "GNcM8U5g8RwTZffwwm3kSQqUNPSwv5d2fbN9sLxPJqt2",
                lpTokenSPL: "PLYJZgSkcV8UXTWhTyf2WLCMeBoZum1Y4rXgXkoYiNj"
            },
            tokenA: "tether",
            tokenB: "tether",
            decimals: 6,
            tvlReader: sunnySaberPoolReader
        }
    ]

    // a mapping of coin name to coin amount
    const tvlResult = {}

    // Run these serially to avoid rate limiting issues
    for (const pool of pools) {
        const poolTVL = await pool.tvlReader(pool);
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

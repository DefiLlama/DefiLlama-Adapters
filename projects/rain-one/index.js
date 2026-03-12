const { getLogs2 } = require('../helper/cache/getLogs')
const axios = require('axios')
const ADDRESSES = require('../helper/coreAssets.json')

const RAIN_PROTOCOL_FACTORY = "0xccCB3C03D9355B01883779EF15C1Be09cf3623F1"
const RAIN_RISK_MARKET_RESERVOIR = "0x3783c98C39c48750D92A7086D3EacBD231EF26b5"

/**
 * Fetch token prices from GeckoTerminal
 */
async function fetchTokenPrices(tokenAddresses) {
    if (!tokenAddresses.length) return new Map()

    const prices = new Map()
    const addresses = tokenAddresses.map(t => t.toLowerCase())
    const BATCH_SIZE = 100 // GeckoTerminal API limit

    for (let i = 0; i < addresses.length; i += BATCH_SIZE) {
        const batch = addresses.slice(i, i + BATCH_SIZE)
        const url =
            `https://api.geckoterminal.com/api/v2/simple/networks/arbitrum/token_price/` +
            batch.join(',')

        try {
            const { data } = await axios.get(url, { timeout: 10_000 })
            if (data?.data?.attributes?.token_prices) {
                for (const [token, priceStr] of Object.entries(data.data.attributes.token_prices)) {
                    const price = Number(priceStr)
                    if (!isNaN(price)) prices.set(token.toLowerCase(), price)
                }
            }
        } catch (e) {
            throw new Error(`Failed to fetch GeckoTerminal prices: ${e.message}`)
        }
    }

    return prices
}

async function rainProtocolTvl(api) {
    const logs = await getLogs2({
        api,
        target: RAIN_PROTOCOL_FACTORY,
        eventAbi: 'event PoolCreated(address indexed poolAddress, address indexed poolCreator, string uri)',
        fromBlock: 307025521,
    })

    const pools = logs.map(l => l.poolAddress.toLowerCase())
    if (!pools.length) return 0

    const tokens = new Set()
    const poolData = []

    await Promise.all(
        pools.map(async pool => {
            let token
            try {
                token = await api.call({
                    target: pool,
                    abi: 'function baseToken() view returns (address)',
                })
            } catch (e) {
                // Only fallback for pools that don't have baseToken (e.g., older contracts)
                // Log for visibility in case this masks real issues
                console.log(`Pool ${pool} baseToken() failed, using USDT fallback: ${e.message}`)
                token = ADDRESSES.arbitrum.USDT
            }

            token = token.toLowerCase()
            tokens.add(token)

            try {
                const [balance, decimals] = await Promise.all([
                    api.call({ abi: 'erc20:balanceOf', target: token, params: pool }),
                    api.call({ abi: 'erc20:decimals', target: token }),
                ])

                poolData.push({
                    token,
                    balance,
                    decimals,
                })
            } catch {
                // Skip pools with non-standard tokens
            }
        })
    )

    const prices = await fetchTokenPrices([...tokens])

    let tvlUsd = 0

    for (const { token, balance, decimals } of poolData) {
        const price = prices.get(token)
        if (!price) continue // token not priced

        const amount = Number(balance) / 10 ** decimals
        tvlUsd += amount * price
    }

    return api.addUSDValue(tvlUsd)
}

async function rainRiskMarketTvl(api) {
    const token = ADDRESSES.arbitrum.USDT
    const [balance, decimals] = await Promise.all([
        api.call({ abi: 'erc20:balanceOf', target: token, params: RAIN_RISK_MARKET_RESERVOIR }),
        api.call({ abi: 'erc20:decimals', target: token }),
    ])
    const tvlUsd = Number(balance) / 10 ** decimals
    return api.addUSDValue(tvlUsd)
}

async function tvl(api) {
    await Promise.all([
        rainProtocolTvl(api),
        rainRiskMarketTvl(api),
    ])
}

module.exports = {
    methodology:
        "TVL includes All Markets Created On https://rain.one",
    arbitrum: {
        tvl: tvl,
    },
    timetravel: false,
}
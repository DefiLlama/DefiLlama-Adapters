const { getLogs2 } = require('../helper/cache/getLogs')
const axios = require('axios')
const ADDRESSES = require('../helper/coreAssets.json')

const RAIN_PROTOCOL_FACTORY = "0xccCB3C03D9355B01883779EF15C1Be09cf3623F1"

/**
 * Fetch token prices from GeckoTerminal
 */
async function fetchTokenPrices(tokenAddresses) {
    if (!tokenAddresses.length) return new Map()

    const url =
        `https://api.geckoterminal.com/api/v2/simple/networks/arbitrum/token_price/` +
        tokenAddresses.map(t => t.toLowerCase()).join(',')

    const { data } = await axios.get(url)
    if (!data?.data?.attributes?.token_prices) return new Map()

    const prices = new Map()
    for (const [token, priceStr] of Object.entries(data.data.attributes.token_prices)) {
        const price = Number(priceStr)
        if (!isNaN(price)) prices.set(token.toLowerCase(), price)
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
            } catch {
                token = ADDRESSES.arbitrum.USDT
            }

            token = token.toLowerCase()
            tokens.add(token)

            const [balance, decimals] = await Promise.all([
                api.call({ abi: 'erc20:balanceOf', target: token, params: pool }),
                api.call({ abi: 'erc20:decimals', target: token }),
            ])

            poolData.push({
                token,
                balance,
                decimals,
            })
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

module.exports = {
    methodology:
        "TVL includes All Markets Created On https://rain.one",
    arbitrum: {
        tvl: rainProtocolTvl,
    },
}
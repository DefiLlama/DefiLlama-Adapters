const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')
const RAIN_PROTOCOL_FACTORY = "0xccCB3C03D9355B01883779EF15C1Be09cf3623F1"

async function rainProtocolTvl(api) {
    // Get all pools
    const logs = await getLogs2({
        api,
        target: RAIN_PROTOCOL_FACTORY,
        eventAbi: 'event PoolCreated(address indexed poolAddress, address indexed poolCreator, string uri)',
        fromBlock: 307025521,
    })

    const poolAddresses = logs.map(l => l.poolAddress)
    if (!poolAddresses.length) return {}

    // Get baseToken for each pool
    const tokensAndOwners = await Promise.all(
        poolAddresses.map(async pool => {
            let token = await api.call({
                target: pool,
                abi: 'function baseToken() view returns (address)',
            }).catch(() => ADDRESSES.arbitrum.USDT) // fallback if call fails
            token = token || ADDRESSES.arbitrum.USDT
            return [token.toLowerCase(), pool.toLowerCase()]
        })
    )

    // Use sumTokens2 to include LP unwrapping if needed
    return sumTokens2({ api, tokensAndOwners, resolveLP: true })
}

module.exports = {
    methodology:
        "TVL includes pools created on rain.one platform.",
    arbitrum: {
        tvl: rainProtocolTvl,
    },
}
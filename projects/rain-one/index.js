const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')

const RAIN_TOKEN = "0x25118290e6a5f4139381d072181157035864099d"
const RAIN_PROTOCOL_FACTORY = "0xccCB3C03D9355B01883779EF15C1Be09cf3623F1"

const NON_CIRCULATING_ADDRESSES = [
    "0xc41A5462362f6AB4A878AE0Aac91b7259f7176A5", // Claim Presale Contract
]

// ---- Treasury TVL ----
async function vesting(api) {
    return api.sumTokens({ owners: NON_CIRCULATING_ADDRESSES, tokens: [RAIN_TOKEN] })
}

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
        "TVL includes RAIN tokens held in Rain.one’s vesting/presale contracts and pools created on rain.one platform.",
    arbitrum: {
        tvl: rainProtocolTvl,
        vesting,
    },
}
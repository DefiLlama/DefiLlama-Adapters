const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Rain.one RAIN token address on Arbitrum
const RAIN_TOKEN = "0x25118290e6a5f4139381d072181157035864099d"
const USDT = "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9" // Arbitrum USDT
const RAIN_PROTOCOL_FACTORY = "0xccCB3C03D9355B01883779EF15C1Be09cf3623F1"

// Non-circulating & treasury wallets
const NON_CIRCULATING_ADDRESSES = [
    "0x467D5Bf8Cfa1a5f99328fBdCb9C751c78934b725", // Sablier Vesting
    "0xc41A5462362f6AB4A878AE0Aac91b7259f7176A5", // Claim Presale Contract
]

// ---- Treasury TVL ----
async function vesting(api) {
    return sumTokens2({
        api,
        tokensAndOwners: [
            ...NON_CIRCULATING_ADDRESSES.map(addr => [RAIN_TOKEN, addr]),
        ],
    })
}

async function rainProtocolTvl(api) {

    const logs = await getLogs({
        api,
        target: RAIN_PROTOCOL_FACTORY,
        topic: 'PoolCreated(address,address,string)',
        eventAbi: 'event PoolCreated(address indexed poolAddress, address indexed poolCreator, string uri)',
        onlyArgs: true,
        fromBlock: 307025521,
    })

    const poolAddresses = logs.map(log => log.poolAddress)
    if (poolAddresses.length === 0) return {}

    // Sum USDT balances in all pools
    return sumTokens2({
        api,
        tokensAndOwners: poolAddresses.map(addr => [USDT, addr]),
    })
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology:
        "TVL includes RAIN tokens held in Rain.one’s vesting/presale contracts and pools created on rain.one platform.",
    arbitrum: {
        tvl: rainProtocolTvl,
        vesting,
    },
}
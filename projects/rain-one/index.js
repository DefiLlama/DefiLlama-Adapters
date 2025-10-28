const { getLogs2 } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')

// Rain.one RAIN token address on Arbitrum
const RAIN_TOKEN = "0x25118290e6a5f4139381d072181157035864099d"
const RAIN_PROTOCOL_FACTORY = "0xccCB3C03D9355B01883779EF15C1Be09cf3623F1"

// Non-circulating & treasury wallets
const NON_CIRCULATING_ADDRESSES = [
    // "0x467D5Bf8Cfa1a5f99328fBdCb9C751c78934b725", // Sablier Vesting -- already counted as part of sablier tvl
    "0xc41A5462362f6AB4A878AE0Aac91b7259f7176A5", // Claim Presale Contract
]

// ---- Treasury TVL ----
async function vesting(api) {
  return api.sumTokens({ owners: NON_CIRCULATING_ADDRESSES, tokens: [RAIN_TOKEN] })
}

async function rainProtocolTvl(api) {

    const logs = await getLogs2({
        api,
        target: RAIN_PROTOCOL_FACTORY,
        eventAbi: 'event PoolCreated(address indexed poolAddress, address indexed poolCreator, string uri)',
        fromBlock: 307025521,
    })

    const poolAddresses = logs.map(log => log.poolAddress)
    if (poolAddresses.length === 0) return {}

    // Sum USDT balances in all pools
    return api.sumTokens({ owners: logs.map(log => log.poolAddress), tokens: [ADDRESSES.arbitrum.USDT] })
}

module.exports = {
    methodology:
        "TVL includes RAIN tokens held in Rain.one’s vesting/presale contracts and pools created on rain.one platform.",
    arbitrum: {
        tvl: rainProtocolTvl,
        vesting,
    },
}

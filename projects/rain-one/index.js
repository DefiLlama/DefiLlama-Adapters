const { getLogs2 } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')

const RAIN_PROTOCOL_FACTORY = "0xccCB3C03D9355B01883779EF15C1Be09cf3623F1"

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
        "TVL includes pools created on rain.one platform.",
    arbitrum: {
        tvl: rainProtocolTvl,
    },
}

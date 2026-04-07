const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const RAIN_PROTOCOL_FACTORY = "0xccCB3C03D9355B01883779EF15C1Be09cf3623F1"
const RAIN_PROTOCOL_FACTORY_V2 = "0xA8640B62D755e42C9ed6A86d0fc65CE09e31F264" // new factory deployed, but old factory is still active and has more TVL, so we need to check both
const RAIN_RISK_MARKET_RESERVOIR = "0x3783c98C39c48750D92A7086D3EacBD231EF26b5"

async function tvl(api) {
    const pools = await api.fetchList({ target: RAIN_PROTOCOL_FACTORY, itemAbi: 'allPools', lengthAbi: 'totalPools' })
    const poolsV2 = await api.fetchList({ target: RAIN_PROTOCOL_FACTORY_V2, itemAbi: 'allPools', lengthAbi: 'totalPools' })
    const tokens = await api.multiCall({ abi: 'address:baseToken', calls: pools })
    const tokensV2 = await api.multiCall({ abi: 'address:baseToken', calls: poolsV2 })
    const tokensAndOwners = tokens.map((token, i) => [token, pools[i]])
    const tokensAndOwnersV2 = tokensV2.map((token, i) => [token, poolsV2[i]])
    tokensAndOwners.push(...tokensAndOwnersV2)
    tokensAndOwners.push([ADDRESSES.arbitrum.USDT, RAIN_RISK_MARKET_RESERVOIR])
    return sumTokens2({ api, tokensAndOwners, resolveLP: true })
}

module.exports = {
    methodology: "TVL includes all markets created on rain.one platform.",
    arbitrum: { tvl },
}
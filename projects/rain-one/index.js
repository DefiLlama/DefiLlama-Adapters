const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const FACTORIES = [
  "0xccCB3C03D9355B01883779EF15C1Be09cf3623F1", // v1
  "0xA8640B62D755e42C9ed6A86d0fc65CE09e31F264", // v2
]
const RAIN_RISK_MARKET_RESERVOIR = "0x3783c98C39c48750D92A7086D3EacBD231EF26b5"

async function tvl(api) {
  const pools = (await Promise.all(FACTORIES.map(target => api.fetchList({ target, itemAbi: 'allPools', lengthAbi: 'totalPools' })))).flat()
  const tokens = await api.multiCall({ abi: 'address:baseToken', calls: pools })
  const tokensAndOwners = tokens.map((token, i) => [token, pools[i]])
  tokensAndOwners.push([ADDRESSES.arbitrum.USDT, RAIN_RISK_MARKET_RESERVOIR])
  return sumTokens2({ api, tokensAndOwners, resolveLP: true })
}

module.exports = {
  methodology: "TVL includes all markets created on rain.one platform.",
  arbitrum: { tvl },
}

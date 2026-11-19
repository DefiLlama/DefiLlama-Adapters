const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const FACTORIES = [
  { target: "0xccCB3C03D9355B01883779EF15C1Be09cf3623F1", fromBlock: 307025521 }, // v1
  { target: "0xA8640B62D755e42C9ed6A86d0fc65CE09e31F264", fromBlock: 446257605 }, // v2, deployed 2026-03-27
]
const RAIN_RISK_MARKET_RESERVOIR = "0x3783c98C39c48750D92A7086D3EacBD231EF26b5"
const RAIN = "0x25118290e6A5f4139381D072181157035864099d"

// [baseToken, pool] for every market that has not been finalized yet
async function getOpenPoolTokens(api) {
  const block = await api.getBlock()
  const pools = []
  for (const { target, fromBlock } of FACTORIES) {
    if (block < fromBlock) continue
    pools.push(...await api.fetchList({ target, itemAbi: 'allPools', lengthAbi: 'totalPools' }))
  }
  const finalized = await api.multiCall({ abi: 'bool:poolFinalized', calls: pools })
  const openPools = pools.filter((_, i) => !finalized[i])
  const tokens = await api.multiCall({ abi: 'address:baseToken', calls: openPools })
  return tokens.map((token, i) => [token, openPools[i]])
}

const isRain = ([token]) => token.toLowerCase() === RAIN.toLowerCase()

async function tvl(api) {
  const tokensAndOwners = (await getOpenPoolTokens(api)).filter(i => !isRain(i))
  tokensAndOwners.push([ADDRESSES.arbitrum.USDT, RAIN_RISK_MARKET_RESERVOIR])
  return sumTokens2({ api, tokensAndOwners, resolveLP: true })
}

async function staking(api) {
  const tokensAndOwners = (await getOpenPoolTokens(api)).filter(isRain)
  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  methodology: "TVL is the base token held by markets that have not been finalized yet, plus the USDT in the risk market reservoir. Funds left unclaimed in finalized markets are not counted. RAIN held by open RAIN markets is counted as staking.",
  arbitrum: { tvl, staking },
}

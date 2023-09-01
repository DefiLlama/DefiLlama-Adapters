const { getCache, get } = require('../helper/http')
const sdk = require('@defillama/sdk')
const { nullAddress } = require('../helper/tokenMapping')

const chainMapping = {
  ETH: 'ethereum',
  BTC: 'bitcoin',
  THOR: 'thorchain',
  DASH: 'dash',
}
const reverseChainMapping = Object.fromEntries(Object.entries(chainMapping).map(([a, b]) => [b, a]))

const defillamaChainMapping = {
  'DASH': 'DASH',
}

const tokenGeckoMapping = {
  'THOR.RUNE': 'thorchain',
}


const evmChains = ['ethereum']

function getDChain(chain) {
  return defillamaChainMapping[chainMapping[chain]] || chainMapping[chain]
}

const blacklistedPools = []

async function tvl(_, _1, _2, { api }) {
  const pools = await getCache('https://midgard.mayachain.info/v2/pools')
  const aChain = api.chain


  const balances = {}
  const decimals = {}
  if (evmChains.includes(aChain)) {
    const mayaChain = reverseChainMapping[aChain]
    const tokens = pools.map(i => i.asset).filter(i => i.startsWith(mayaChain)).map(i => i.split('-')[1]?.toLowerCase()).filter(i => i?.startsWith('0X'))
    const decimalsRes = await api.multiCall({ abi: 'erc20:decimals', calls: tokens })
    decimalsRes.forEach((i, index) => { decimals[tokens[index]] = i })
  }
  await Promise.all(pools.map(addPool))
  return balances


  async function addPool({ asset: pool, assetDepth: totalDepth, runeDepth }) {
    if (blacklistedPools.includes(pool)) return;
    if (aChain === 'mayachain') {
      sdk.util.sumSingleBalance(balances, 'mayachain', runeDepth / 1e10)
      return;
    }
    if (+totalDepth < 1) return;
    let [chainStr, token] = pool.split('.')
    let chain = chainMapping[chainStr]
    const dChain = getDChain(chainStr)
    if (dChain !== aChain) return;

    let [baseToken, address] = token.split('-')
    if (evmChains.includes(chain)) {
      if (address && address.length > 8) {
        address = address.toLowerCase()
        if (!decimals[address]) throw new Error('no decimals for ' + address)
        totalDepth = totalDepth * (10 ** (decimals[address] - 10))
        sdk.util.sumSingleBalance(balances, address, totalDepth, chain)
      } else if (chainStr === baseToken) {
        sdk.util.sumSingleBalance(balances, nullAddress, totalDepth * 1e10, chain)
      } else if (tokenGeckoMapping[pool]) {
        sdk.util.sumSingleBalance(balances, tokenGeckoMapping[pool], totalDepth / 1e10)
      } else {
        sdk.log('skipped', pool, Number(totalDepth).toFixed(2))
      }
    } else {
      if (chainStr === baseToken) {
        if (chain === 'DASH') chain = 'dash'
        sdk.util.sumSingleBalance(balances, chain, totalDepth / 1e10)
      } else if (tokenGeckoMapping[pool]) {
        sdk.util.sumSingleBalance(balances, tokenGeckoMapping[pool], totalDepth / 1e10)
      } else {
        sdk.log('skipped', pool, totalDepth)
      }
    }
  }
}

module.exports = {
  timetravel: false,
  mayachain: {
    tvl
  },
}

Object.keys(chainMapping).map(getDChain).forEach(chain => {
  module.exports[chain] = { tvl }
})

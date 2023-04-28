const { get } = require('../helper/http')

const chains = {
  '1': 'ethereum',
  '10': 'optimism',
  '24': 'kardia',
  '25': 'cronos',
  '30': 'rsk',
  '40': 'telos',
  '56': 'bsc',
  '57': 'syscoin',
  '58': 'ontology_evm',
  '61': 'ethereumclassic',
  '66': 'okexchain',
  '70': 'hoo',
  '88': 'tomochain',
  '100': 'xdai',
  '106': 'velas',
  '108': 'thundercore',
  '122': 'fuse',
  '128': 'heco',
  '137': 'polygon',
  '199': 'bittorrent',
  '250': 'fantom',
  '288': 'boba',
  '321': 'kcc',
  '336': 'shiden',
  '592': 'astar',
  '1024': 'clv',
  '1030': 'conflux',
  '1088': 'metis',
  '1101': 'polygon_zkevm',
  '1284': 'moonbeam',
  '1285': 'moonriver',
  '1818': 'cube',
  '1294': 'boba',
  '2000': 'dogechain',
  '2001': 'milkomeda',
  '2002': 'milkomeda_a1',
  '2020': 'ronin',
  '2222': 'kava',
  '4689': 'iotex',
  '8217': 'klaytn',
  '9001': 'evmos',
  '10000': 'smartbch',
  '10001': 'ethpow',
  '32659': 'fusion',
  '42161': 'arbitrum',
  '42170': 'arbitrum_nova',
  '42220': 'celo',
  '42262': 'oasis',
  '43114': 'avax',
  '47805': 'rei',
  '53935': 'dfk',
  '71402': 'godwoken_v1',
  '1313161554': 'aurora',
  '1666600000': 'harmony',
  '32520': 'bitgert'
}



const sleep = ms => new Promise(r => setTimeout(r, ms));

let coingeckoMcapsPromise

async function getCgMcaps() {
    if (!coingeckoMcapsPromise) coingeckoMcapsPromise = _getData()
  return coingeckoMcapsPromise

  async function _getData() {
    const protocolsInChain = await getChainData()
    const protocolsWithRouters = Array.from(new Set(protocolsInChain.filter(p => p.type === "router" && p.label !== null).map(p => p.label.toLowerCase())));

    const coingeckoMcaps = {}
    const step = 200;
    for (let i = 0; i < protocolsWithRouters.length; i += step) {
      console.log(i / step)
      const cgUrl = `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&include_market_cap=true&ids=${protocolsWithRouters.slice(i, i + step).join(',')
        }`
      await sleep(1e3)
      const partMcaps = await get(cgUrl)
      Object.assign(coingeckoMcaps, partMcaps)
    }
    return coingeckoMcaps
  }
}

let chainData
async function getChainData() {
  if (!chainData) chainData = get('https://netapi.anyswap.net/bridge/v2/info').then(i => i.bridgeList.filter(j => j.amount > 0))
  return chainData
}

function fetchChain(chain) {
  return async () => {
    const data = await getChainData()
    const protocolsInChain = chain === null ? data : data.filter(p => p.srcChainId.toString() === chain.toString())

    const coingeckoMcaps = await getCgMcaps();
    const counted = {}
    let total = 0
    protocolsInChain.forEach((item) => {
      const tvl = Number(item.tvl || 0)

      if (item.type === "bridge") {
        total += tvl
      } else if (item.type === "router") {
        const label = item.label
        const mcap = coingeckoMcaps[label]?.usd_market_cap
        if (counted[label] === undefined) {
          counted[label] = 0
        }
        if (mcap !== undefined && mcap > counted[label]) {
          const tvlToAdd = Math.min(tvl, mcap - counted[label])
          total += tvlToAdd
          counted[label] += tvlToAdd
        }
      }
    })
    return total
  }
}


const chainTvls = {}
Object.keys(chains).forEach((chain) => {
  const chainName = chains[chain]
  chainTvls[chainName] = {
    fetch: fetchChain(chain)
  }
})

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  ...chainTvls,
  fetch: fetchChain(null),
  hallmarks:[
    [1651881600, "UST depeg"],
  ],
}

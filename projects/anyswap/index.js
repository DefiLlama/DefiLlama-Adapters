const sdk = require('@defillama/sdk')
const { sumTokens } = require('../helper/sumTokens')
const { getConfig } = require('../helper/cache')
const ADDRESSES = require('../helper/coreAssets.json')


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

let chainData
async function getChainData() {
  if (!chainData) chainData = getConfig('anyswap-config', 'https://netapi.anyswap.net/bridge/v2/info').then(i => i.bridgeList.filter(j => j.amount > 0))
  return chainData
}

const blacklistedTokens = [
  '0xc342774492b54ce5f8ac662113ed702fc1b34972' // BGEO
]

const EXECUTOR = '0x2A038e100F8B85DF21e4d44121bdBfE0c288A869'
const NEW_ADDR = '0x1eed63efba5f81d95bfe37d82c8e736b974f477b'

function fetchChain(chain) {
  return async (_, _1, _2, { api }) => {
    const data = await getChainData()
    const protocolsInChain = chain === null ? data : data.filter(p => p.srcChainId.toString() === chain.toString())
    const tokensAndOwners = []
    protocolsInChain.forEach((item) => {
      if (item.type === "bridge") {
        let token = item.srcToken
        let owner = item.depositAddr
        if (owner.startsWith("0x") && !token.startsWith("0x")) {
          sdk.log(chain, 'replace', token, 'with null')
          token = ADDRESSES.null
        }
        tokensAndOwners.push([token, owner])
        tokensAndOwners.push([token, EXECUTOR])
        // tokensAndOwners.push([token, NEW_ADDR])
      } else if (item.type === "router") {
        if (item.token === item.srcToken && item.underlying) {
          tokensAndOwners.push([item.underlying, item.token])
          tokensAndOwners.push([item.underlying, EXECUTOR])
          // tokensAndOwners.push([item.underlying, NEW_ADDR])
        }
      }
    })

    return sumTokens({ api, tokensAndOwners, blacklistedTokens, })
  }
}


const chainTvls = {}
Object.keys(chains).forEach((chain) => {
  const chainName = chains[chain]
  chainTvls[chainName] = {
    tvl: fetchChain(chain)
  }
})

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  ...chainTvls,
  // fetch: fetchChain(null),
  hallmarks: [
    [1651881600, "UST depeg"],
    [1689202800,"Access to Wallets Lost"]
  ],
}

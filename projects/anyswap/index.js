const { get } = require('../helper/http')

const { sumTokens } = require('../helper/sumTokens')
const { getConfig } = require('../helper/cache');
const { nullAddress } = require('../helper/tokenMapping');

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

async function getChainData() {
  const { bridgeList } = await getConfig('anyswap', 'https://netapi.anyswap.net/bridge/v2/info')
  return bridgeList
}

module.exports = {
  timetravel: false,
  hallmarks: [
    [1651881600, "UST depeg"],
  ],
}

const config = {
  ethereum: { null: 'ETH' },
  polygon: { null: 'MATIC' },
  fantom: { null: 'FTM' },
  // fusion: { null: 'FSN' },
  bsc: { null: 'BNB' },
  shiden: { null: 'SDN' },
  avax: { null: 'AVAX' },
  heco: { null: 'HT' },
  harmony: { null: 'ONE' },
  dfk: { null: 'JEWEL' },
  arbitrum: {},
  moonriver: {},
  celo: {},
  iotex: {},
  telos: {},
  fuse: {},
  moonbeam: {},
  boba: {},
  velas: {},
  moonbeam: {},
  boba: {},
  velas: {},
  optimism: {},
  kardia: {},
  cronos: {},
  rsk: {},
  aurora: {},
  bitgert: {},
  godwoken_v1: {},
  rei: {},
  oasis: {},
  arbitrum_nova: {},
  boba_avax: {},
  boba_bnb: {},
  kcc: {},
  astar: {},
  clv: {},
  metis: {},
  polygon_zkevm: {},
  dogechain: {},
  milkomeda: {},
  milkomeda_a1: {},
  ronin: {},
  kava: {},
  klaytn: {},
  evmos: {},
  smartbch: {},
  ethpow: {},
  syscoin: {},
  ontology_evm: {},
  ethereumclassic: {},
  okexchain: {},
  tomochain: {},
  xdai: {},
  velas: {},
  thundercore: {},
  bittorrent: {},
  gt: {},
  rsk: {},
  mintme: {},
  step: {},
  rpg: {},
  wemix: {},
  kekchain: {},
  // dexit: {},
  hpb: {},
  omax: {},
  canto: {},
  findora: {},
  era: {},
  eos_evm: {},
  flare: {},
  // tenet: {},
  // meld: {},
  bitcoin: { nonTuringComplete: true, chainId: 'BTC' },
  litecoin: { nonTuringComplete: true, chainId: 'LTC' },
  terra: { nonTuringComplete: true, chainId: 'TERRA' },
  near: {},

}

const blacklistedTokens = [
  '0xab167e816e4d76089119900e941befdfa37d6b32', // SHINJA
  '0xc342774492b54ce5f8ac662113ed702fc1b34972', // BGEO
  '0xc312642dad4490d7f351391b85488d34778e9667', // BGEO
]

Object.keys(config).forEach(chain => { module.exports[chain] = { tvl } })

async function tvl(_, _b, _cb, { api, }) {
  const bridgeList = await getChainData()
  let { nonTuringComplete, chainId } = config[api.chain] || {}
  if (nonTuringComplete) {
    const owners = bridgeList.filter(i => i.srcChainId === chainId).map(i => i.depositAddr)
    return sumTokens({ api, owners})
  }
  const transformToken = (token) => token.toUpperCase() === config[api.chain]?.null ? nullAddress : token
  if (!chainId) chainId = api.chainId + ''
  const tokensAndOwners = bridgeList.filter(i => i.srcChainId === chainId && i.type === 'bridge').map(i => [transformToken(i.srcToken), i.depositAddr])
  bridgeList.filter(i => i.srcChainId === chainId && i.type === 'router').filter(i => i.underlying).filter(i => tokensAndOwners.push([transformToken(i.underlying), i.srcToken]))
  // console.table(tokensAndOwners)
  // console.log(api.chain)
  // return sumTokens({ api, tokensAndOwners, permitFailure: true, })
  return sumTokens({ api, tokensAndOwners, permitFailure: false, blacklistedTokens })
}
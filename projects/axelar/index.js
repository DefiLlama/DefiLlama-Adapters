const { getConfig } = require('../helper/cache')
const { sumTokens, sumTokensExport } = require('../helper/sumTokens');
const { sumTokens2 } = require('../helper/unwrapLPs');

// Token lists come from Axelarscan's asset registries (getAssets / getITSAssets).
// Owner addresses (gateways, ITS token managers, IBC escrows) are stable, so gateways and
// escrows are hardcoded below; the registry only tells us which tokens to look at, and
// on-chain balances remain the source of truth.
const chainMapping = {
  avax: 'avalanche',
  cosmos: 'cosmoshub',
  xrplevm: 'xrpl-evm',
  terra2: 'terra-2',
  bsc: 'binance',
  imx: 'immutable',
};

// AxelarGateway contract per EVM chain
const gateways = {
  ethereum: '0x4F4495243837681061C4743b74B3eEdf548D56A5',
  bsc: '0x304acf330bbE08d1e512eefaa92F6a57871fD895',
  fantom: '0x304acf330bbE08d1e512eefaa92F6a57871fD895',
  polygon: '0x6f015F16De9fC8791b234eF68D486d2bF203FBA8',
  avax: '0x5029C0EFf6C34351a0CEc334542cDb22c7928f78',
  moonbeam: '0x4F4495243837681061C4743b74B3eEdf548D56A5',
  arbitrum: '0xe432150cce91c13a887f7D836923d5597adD8E31',
  optimism: '0xe432150cce91c13a887f7D836923d5597adD8E31',
  base: '0xe432150cce91c13a887f7D836923d5597adD8E31',
  mantle: '0xe432150cce91c13a887f7D836923d5597adD8E31',
  celo: '0xe432150cce91c13a887f7D836923d5597adD8E31',
  kava: '0xe432150cce91c13a887f7D836923d5597adD8E31',
  filecoin: '0xe432150cce91c13a887f7D836923d5597adD8E31',
  linea: '0xe432150cce91c13a887f7D836923d5597adD8E31',
  scroll: '0xe432150cce91c13a887f7D836923d5597adD8E31',
  imx: '0xe432150cce91c13a887f7D836923d5597adD8E31',
  fraxtal: '0xe432150cce91c13a887f7D836923d5597adD8E31',
  blast: '0xe432150cce91c13a887f7D836923d5597adD8E31',
  xrplevm: '0xe432150cce91c13a887f7D836923d5597adD8E31',
  aurora: '0x304acf330bbE08d1e512eefaa92F6a57871fD895',
};

// ICS-20 escrow account of the Axelar transfer channel on each cosmos chain
const escrows = {
  agoric: ['agoric1wsxce0ls59rtj70fwcrxmtmmv32vpgmgl3wen2'],
  carbon: ['swth1r726yra3euctv92qqfxh45xztewgp2qjt63vyu'],
  celestia: ['celestia1kq2rzz6fq2q7fsu75a9g7cpzjeanmk68e050pe'],
  cosmos: ['cosmos1vtjqm7gpsaku96h9nyqea5ke8lcvcrr4spy3nm'],
  juno: ['juno19daktj4wktnnng3cgfg60ygsc2m5juldavll78'],
  osmosis: ['osmo1fvn6204xqgqknqepc2ent640gdyegumr2udqjz'],
  persistence: ['persistence19g3j63gysl7ntknvzlrdvfq4fqa9sp07ymnke2'],
  regen: ['regen19xpt04xkxxnlnxcze9cje78c2jsa2vkyfy6v6p'],
  sei: ['sei12k2pyuylm9t7ugdvz67h9pg4gmmvhn5vj25yh4'],
  stargaze: ['stars1kr0zkc0zwdfmz4vnqqvg0h3tfva7yltvrzxsqa'],
  stride: ['stride1qjp5mndargkj0nexrh2jgy6dx4jfdt3rfstxw0'],
  umee: ['umee1ukv0qhw3zszzyjty32cck2j229ekpmr6jj8dca'],
  // exported but not counted: Axelarscan lists no escrow for them
  archway: [], chihuahua: [], dymension: [], injective: [], neutron: [], secret: [], terra2: [], xpla: [],
};

const blacklistedTokensChain = {
  ethereum: ['0x946fb08103b400d1c79e07acCCDEf5cfd26cd374'], // KIP tvl is higher than the circulating supply
}

async function evmTvl(api) {
  const chain = api.chain
  const mappedChain = chainMapping[chain] || chain
  const gateway = gateways[chain]
  if (!gateway) throw new Error('Missing Axelar gateway address for ' + chain)

  const [assets, itsAssets] = await Promise.all([
    getConfig('axelar/assets', 'https://api.axelarscan.io/api/getAssets'),
    getConfig('axelar/its-assets', 'https://api.axelarscan.io/api/getITSAssets'),
  ])

  const tokensAndOwners = []
  assets.forEach(({ addresses = {} }) => {
    const entry = addresses[mappedChain]
    if (!entry?.address) return
    if (entry.symbol?.startsWith('axl')) return
    tokensAndOwners.push([entry.address, gateway])
  })

  itsAssets.forEach(({ chains = {} }) => {
    const entry = chains[mappedChain]
    if (!entry?.tokenAddress || !entry.tokenManager) return
    if (entry.tokenManagerType && entry.tokenManagerType !== 'lockUnlock') return
    tokensAndOwners.push([entry.tokenAddress, entry.tokenManager])
  })

  return sumTokens2({ api, tokensAndOwners, blacklistedTokens: blacklistedTokensChain[chain], permitFailure: true, })
}

Object.keys(gateways).forEach(chain => {
  module.exports[chain] = { tvl: evmTvl }
})

Object.keys(escrows).forEach(chain => {
  module.exports[chain] = {
    tvl: escrows[chain].length ? () => sumTokens({ chain, owners: escrows[chain], }) : () => ({})
  }
})

// dead chains
module.exports.evmos = { tvl: () => ({}) }
module.exports.kujira = { tvl: () => ({}) }
module.exports.migaloo = { tvl: () => ({}) }

module.exports.timetravel = false;

module.exports.ripple = {
  tvl: sumTokensExport({ owner: 'rfmS3zqrQrka8wVyhXifEeyTwe8AMz2Yhw'})
}

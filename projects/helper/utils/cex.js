const sdk = require('@defillama/sdk')

const binanceNetworkMapping = {
  // Major chains (10+ tokens)
  // ETH: 'ethereum',
  // BSC: 'bsc',
  SOL: 'solana',
  BASE: 'base',
  ARBITRUM: 'arbitrum',
  MATIC: 'polygon',
  OPTIMISM: 'optimism',
  AVAXC: 'avax',
  // FTM: 'fantom',
  // TRX: 'tron',
  // CHZ2: 'chz',
  // Mid-tier (4-9 tokens)
  RON: 'ronin',
  SUI: 'sui',
  EOS: 'eos',
  TON: 'ton',
  ZKSYNCERA: 'era',
  // ONT: 'ontology',
  APT: 'aptos',
  // 3 tokens
  SCROLL: 'scroll',
  NEAR: 'near',
  WLD: 'wc',
  // NEO3: 'neo3',
  // XRP: 'ripple',
  // STATEMINT: 'polkadot',
  // OPBNB: 'op_bnb',
  CELO: 'celo',
  // KAVAEVM: 'kava',
  XLM: 'stellar',
  LUNC: 'terra',
  // 2 tokens
  SEIEVM: 'sei',
  SONIC: 'sonic',
  STARKNET: 'starknet',
  WAVES: 'waves',
  KAVA: 'kava',
  HEMI: 'hemi',
  // BNB: 'binance',
  MANTA: 'manta',
  NEO: 'neo',
  EGLD: 'elrond',
  LINEA: 'linea',
  ALGO: 'algorand',
  HBAR: 'hedera',
  THETA: 'theta',
  BERA: 'berachain',
  VET: 'vechain',
  KAIA: 'klaytn',
  PLASMA: 'plasma',
  XTZ: 'tezos',
  NULS: 'nuls',
  // 1 token
  AE: 'aeternity',
  BCH: 'bitcoincash',
  SEI: 'sei',
  BB: 'bouncebit',
  FLR: 'flare',
  SGB: 'songbird',
  SCRT: 'secret',
  FLOW: 'flow',
  ATOM: 'cosmos',
  ROSE: 'oasis',
  TOMO: 'tomochain',
  MA: 'manta',
  PLUME: 'plume',
  MANTRA: 'mantra',
  ETHW: 'ethpow',
  IOTX: 'iotex',
  KDA2: 'kadena',
  STX: 'stacks',
  BTC: 'bitcoin',
  SEGWITBTC: 'bitcoin',
  IOTA: 'iota',
  REEF: 'reef',
  ONE: 'harmony',
  DYM: 'dymension',
  ICP: 'icp',
  ZEC: 'zcash',
  ICX: 'icon',
  XAI: 'xai',
  DOGE: 'doge',
  OSMO: 'osmosis',
  NTRN: 'neutron',
  SYS: 'syscoin',
  ALLORA: 'allora',
  ZIL: 'zilliqa',
  FOGO: 'fogo',
  WAX: 'wax',
  TAO: 'bittensor',
  BEAM: 'beam',
  INJ: 'injective',
  PARA: 'parallel',
  KUSAMA: 'kusama',
  MOVE: 'move',
  MOVR: 'moonriver',
  VITE: 'vite',
  CFX: 'conflux',
  CFXEVM: 'conflux',
  ACA: 'acala',
  TIA: 'celestia',
  REI: 'rei',
  ELF: 'aelf',
  ADA: 'cardano',
  CHR: 'chromia',
  BLAST: 'blast',
  BABY: 'babylon',
  SOMI: 'somnia',
  LUNA: 'terra2',
  RSK: 'rsk',
  INIT: 'initia',
  GLMR: 'moonbeam',
  SOPH: 'sophon',
  ETC: 'ethereumclassic',
  KLAY: 'klaytn',
  VANA: 'vana',
  '0G': '0g',
  FRAXTAL: 'fraxtal',
  BAND: 'band',
  ASTR: 'astar',
  POLYX: 'polymesh',
  RVN: 'rvn',
  STRAX: 'stratis',
  WAN: 'wan',
  RUNE: 'thorchain',
  AVAX: 'avax',
  DASH: 'dash',
  SAGA: 'saga',
  LTC: 'litecoin',
  METIS: 'metis',
  DYDX: 'dydx',
  FIL: 'filecoin',
  FILEVM: 'filecoin',
}

let chainMappings

async function _getChainMappings() {
  let data = await sdk.cache.readExpiringJsonCache('binance-cex-tokens-local')
  if (!data) {
    sdk.log('No local cache found for Binance CEX tokens, fetching from API...')
    data = await sdk.cache.cachedFetch({
      endpoint: 'https://www.binance.com/bapi/capital/v1/public/capital/getNetworkCoinAll',
      key: 'binance-cex-tokens',
      writeCacheOptions: { skipR2CacheWrite: false, }
    })
    await sdk.cache.writeExpiringJsonCache('binance-cex-tokens-local', data, {})
  }
  let mappings = {}
  data.data.forEach((item) => {
    (item.networkList ?? []).forEach(({ network, contractAddress }) => {
      const chain = binanceNetworkMapping[network]
      if (!chain) return;
      if (!contractAddress?.startsWith('0x')) return;
      if (contractAddress.length !== '0x5a98fcbea516cf06857215779fd812ca3bef1b32'.length) return;
      if (!mappings[chain]) mappings[chain] = []

      mappings[chain].push(contractAddress)
    })
  })

  return mappings
}

async function getCEXTokensOnBinance() {
  if (!chainMappings) {
    chainMappings = _getChainMappings()
    chainMappings = await chainMappings
  }
  return chainMappings
}

async function getCEXTokensOnBinanceOnChain(chain) {
  const cMappings = await getCEXTokensOnBinance()
  return cMappings[chain] ?? []
}


module.exports = {
  getCEXTokensOnBinanceOnChain
}
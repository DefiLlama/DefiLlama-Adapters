const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')
const { getTokenBalance } = require('../helper/chain/tron');
const { toUSDTBalances } = require('../helper/balances')
const { get } = require('../helper/http')
const { mergeExports } = require('../helper/utils')

const dexExports = {
  avax: {
    tvl: getUniTVL({
      factory: '0x839547067bc885db205F5fA42dcFeEcDFf5A8530',
      chain: 'avax',
      useDefaultCoreAssets: true,
    }),
  },
  bsc: {
    tvl: getUniTVL({
      factory: '0xA5Ba037Ec16c45f8ae09e013C1849554C01385f5',
      chain: 'bsc',
      useDefaultCoreAssets: true,
    }),
  },
  iotex: {
    tvl: getUniTVL({
      factory: '0x839547067bc885db205F5fA42dcFeEcDFf5A8530',
      chain: 'iotex',
      useDefaultCoreAssets: true,
    }),
  },
  ontology_evm: {
    tvl: getUniTVL({
      factory: '0x839547067bc885db205F5fA42dcFeEcDFf5A8530',
      chain: 'ontology_evm',
      useDefaultCoreAssets: true,
    }),
  },
  ethereum: {
    tvl: getUniTVL({
      factory: '0x08e7974CacF66C5a92a37c221A15D3c30C7d97e0',
      chain: 'ethereum',
      useDefaultCoreAssets: true,
    }),
    staking: staking('0x2e2fb3db9ecdb9b7d9eb05e00964c8941f7171a7', '0x441761326490cACF7aF299725B6292597EE822c2')
  },
  fantom: {
    tvl: getUniTVL({
      factory: '0x839547067bc885db205F5fA42dcFeEcDFf5A8530',
      chain: 'fantom',
      useDefaultCoreAssets: true,
    }),
  },
  harmony: {
    tvl: getUniTVL({
      factory: '0x7aB6ef0cE51a2aDc5B673Bad7218C01AE9B04695',
      chain: 'harmony',
      useDefaultCoreAssets: true,
    }),
  },
  polygon: {
    tvl: getUniTVL({
      factory: '0x4FEE52912f81B78C3CdcB723728926ED6a893D27',
      chain: 'polygon',
      useDefaultCoreAssets: true,
    }),
  },
  bittorrent: {
    tvl: getUniTVL({
      factory: '0xCAaB36C77841647dC9955B3b1D03710E9B9F127f',
      chain: 'bittorrent',
      useDefaultCoreAssets: true,
    }),
  },
  tron: {
    tvl: async () => {
      return {
        "tether": await getTokenBalance(ADDRESSES.tron.USDT, 'TDrFhbM8kDiPtSx3Cgd71K3qwwu77bRdYQ'),
        "tron": await getTokenBalance('TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR', 'TDrFhbM8kDiPtSx3Cgd71K3qwwu77bRdYQ'),
      }
    }
  },
}


let _stakedResponse

const mapping = {
  harmony: 'Harmony',
  icon: 'Icon',
  ontology: 'Ontology',
  tron: 'Tron',
  iotex: 'IoTeX',
}

const stakingExports = {}

function stakingChain(chain) {
  stakingExports[chain] = {
    tvl: async () => {
      if (!_stakedResponse) _stakedResponse = get('https://data.unifi.report/api/stake-data/grouped')
      const { results } = await _stakedResponse
      const blockchainName = mapping[chain]
      const { delegated_stake_usd } = results.find(i => i.blockchain === blockchainName)
      return toUSDTBalances(delegated_stake_usd)
    }
  }
}

Object.keys(mapping).forEach(stakingChain)

module.exports = mergeExports([{
  timetravel: false,
},
  dexExports,
  stakingExports,
])

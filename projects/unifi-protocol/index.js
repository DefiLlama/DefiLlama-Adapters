const { getUniTVL } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')
const ethers = require("ethers")
const { config } = require('@defillama/sdk/build/api');
const { getTokenBalance } = require('../helper/tron');
const { toUSDTBalances } = require('../helper/balances')
const { get } = require('../helper/http')
const { mergeExports } = require('../helper/utils')

config.setProvider("ontology_evm", new ethers.providers.StaticJsonRpcProvider(
  "https://dappnode1.ont.io:10339",
  {
    name: "ontology_evm",
    chainId: 58,
  }
))

const dexExports = {
  avax: {
    tvl: getUniTVL({
      factory: '0x839547067bc885db205F5fA42dcFeEcDFf5A8530',
      chain: 'avax',
      coreAssets: [
        '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7', // wavax
        '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e', // USDC
        '0xc7198437980c041c805a1edcba50c1ce5db95118', // USDT
      ],
    }),
  },
  bsc: {
    tvl: getUniTVL({
      factory: '0xA5Ba037Ec16c45f8ae09e013C1849554C01385f5',
      chain: 'bsc',
      coreAssets: [
        '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // wbnb
        '0xe9e7cea3dedca5984780bafc599bd69add087d56', // busd
        '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', // USDC
        '0x55d398326f99059ff775485246999027b3197955', // USDT
        '0x2170ed0880ac9a755fd29b2688956bd959f933f8', // ETH
      ],
    }),
  },
  iotex: {
    tvl: getUniTVL({
      factory: '0x839547067bc885db205F5fA42dcFeEcDFf5A8530',
      chain: 'iotex',
      coreAssets: [
        '0xa00744882684c3e4747faefd68d283ea44099d03'
      ],
    }),
  },
  ontology_evm: {
    tvl: getUniTVL({
      factory: '0x839547067bc885db205F5fA42dcFeEcDFf5A8530',
      chain: 'ontology_evm',
      coreAssets: [
        '0xd8bc24cfd45452ef2c8bc7618e32330b61f2691b'
      ],
    }),
  },
  ethereum: {
    tvl: getUniTVL({
      factory: '0x08e7974CacF66C5a92a37c221A15D3c30C7d97e0',
      chain: 'ethereum',
      coreAssets: [
        '0xdac17f958d2ee523a2206206994597c13d831ec7',
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      ],
    }),
    staking: staking('0x2e2fb3db9ecdb9b7d9eb05e00964c8941f7171a7', '0x441761326490cACF7aF299725B6292597EE822c2')
  },
  fantom: {
    tvl: getUniTVL({
      factory: '0x839547067bc885db205F5fA42dcFeEcDFf5A8530',
      chain: 'fantom',
      coreAssets: [
        '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83'
      ],
    }),
  },
  harmony: {
    tvl: getUniTVL({
      factory: '0x7aB6ef0cE51a2aDc5B673Bad7218C01AE9B04695',
      chain: 'harmony',
      coreAssets: [
        '0xcf664087a5bb0237a0bad6742852ec6c8d69a27a'
      ],
    }),
  },
  polygon: {
    tvl: getUniTVL({
      factory: '0x4FEE52912f81B78C3CdcB723728926ED6a893D27',
      chain: 'polygon',
      coreAssets: [
        '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'
      ],
    }),
  },
  // bittorrent: {
  //   tvl: getUniTVL({
  //     factory: '0xCAaB36C77841647dC9955B3b1D03710E9B9F127f',
  //     chain: 'bittorrent',
  //     coreAssets: [
  //       '0x8D193c6efa90BCFf940A98785d1Ce9D093d3DC8A'
  //     ],
  //   }),
  // },
  tron: {
    tvl: async () => {
      return {
        "tether": await getTokenBalance('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', 'TDrFhbM8kDiPtSx3Cgd71K3qwwu77bRdYQ'),
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

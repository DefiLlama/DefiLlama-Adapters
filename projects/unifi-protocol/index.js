const { getUniTVL } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')

const dexExports = {
  timetravel: false,
  misrepresentedTokens: true,
  avax: {
    tvl: getUniTVL({
      factory: '0x839547067bc885db205F5fA42dcFeEcDFf5A8530',
      useDefaultCoreAssets: true,
    }),
  },
  bsc: {
    tvl: getUniTVL({
      factory: '0xA5Ba037Ec16c45f8ae09e013C1849554C01385f5',
      useDefaultCoreAssets: true,
    }),
  },
  iotex: {
    tvl: getUniTVL({
      factory: '0x839547067bc885db205F5fA42dcFeEcDFf5A8530',
      useDefaultCoreAssets: true,
    }),
  },
  ontology_evm: {
    tvl: getUniTVL({
      factory: '0x839547067bc885db205F5fA42dcFeEcDFf5A8530',
      useDefaultCoreAssets: true,
    }),
  },
  ethereum: {
    tvl: getUniTVL({
      factory: '0x08e7974CacF66C5a92a37c221A15D3c30C7d97e0',
      useDefaultCoreAssets: true,
    }),
    staking: staking('0x2e2fb3db9ecdb9b7d9eb05e00964c8941f7171a7', '0x441761326490cACF7aF299725B6292597EE822c2')
  },
  fantom: {
    tvl: getUniTVL({
      factory: '0x839547067bc885db205F5fA42dcFeEcDFf5A8530',
      useDefaultCoreAssets: true,
    }),
  },
  harmony: {
    tvl: getUniTVL({
      factory: '0x7aB6ef0cE51a2aDc5B673Bad7218C01AE9B04695',
      useDefaultCoreAssets: true,
    }),
  },
  polygon: {
    tvl: getUniTVL({
      factory: '0x4FEE52912f81B78C3CdcB723728926ED6a893D27',
      useDefaultCoreAssets: true,
    }),
  },
  bittorrent: {
    tvl: getUniTVL({
      factory: '0xCAaB36C77841647dC9955B3b1D03710E9B9F127f',
      useDefaultCoreAssets: true,
    }),
  },
  tron: {
    tvl: getUniTVL({
      factory: 'TUtmsH4DZewoihrybFU2RG1pdW9sBhuSRZ',
      useDefaultCoreAssets: true,
    }),
  },
}

module.exports = dexExports
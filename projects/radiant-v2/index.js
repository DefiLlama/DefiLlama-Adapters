const { staking } = require("../helper/staking");
const { sumTokensExport } = require("../helper/unwrapLPs");
const { aaveExports, methodology, aaveV2Export, } = require("../helper/aave");
const { mergeExports } = require('../helper/utils');

const coreMarkets = {
  methodology,
  arbitrum: {
    ...aaveExports(undefined, undefined, undefined, ['0xDd109cb6F2B2aEeBcE01727a31d99E3149aa7e41']),
    // balancer pool is not unwrapped properly, so we use staking and rely on price api instead
    pool2: staking("0x76ba3eC5f5adBf1C58c91e86502232317EeA72dE", "0x32df62dc3aed2cd6224193052ce665dc18165841"),
  },
  bsc: {
    ...aaveExports(undefined, '0x1e8323a513e099322aa435d172f1e7836fc620a5'),
    // balancer pool is not unwrapped properly, so we use staking and rely on price api instead
    pool2: sumTokensExport({ owner: '0x4fd9f7c5ca0829a656561486bada018505dfcb5e', tokens: ['0x346575fc7f07e6994d76199e41d13dc1575322e1'], useDefaultCoreAssets: true, })
  },
  ethereum: {
    ...aaveExports(undefined, '0xe969066F2cCcE3145f62f669F151c6D566068BA2'),
    // balancer pool is not unwrapped properly, so we use staking and rely on price api instead
    pool2: staking("0x28e395a54a64284dba39652921cd99924f4e3797", "0xcF7b51ce5755513d4bE016b0e28D6EDEffa1d52a")
  },
  base: {
    ...aaveExports(undefined, '0x3eAF348Cf1fEC09C0f8d4f52AD3B8D894206b724'),
    // balancer pool is not unwrapped properly, so we use staking and rely on price api instead
    pool2: staking("0xD87F8a52a91680c993ece968B281bf92505A3741", "0x8a76639fe8e390ed16ea88f87beb46d6a5328254")
  },
};

const rizMarketsConfig = {
  arbitrum: [
    '0x3fEc9583827431F622A4b188b6c57CfFE8655b8e',
    '0x32F9460386A842E43E3e09fA92Bb77412Aabf42B',
    '0xf3007F6d241EbF00140b94D92849B5ACf0D36133',
    '0x6EF47f768aeAe173712Fe6a662666B1DBB08c66F',
    '0x0C19836CcD6eAcb9E21693e1f27bde10218b6701',
    '0x6B712099ab3Eb192F11E4964b35De8BAA7b15299',
    '0x6B392CeBb1C7f0D93D8CF99a25A21C118b347a16',
    '0x16910EC43fe08190aD228910B58656243c675822',
  ],
  bsc: [
    '0x8E4660b30d09C94Ea77795727c55d69799a9Abd1',
    '0x486a97Dd8341C7590238b583580C78DC9151B8a6',
    '0xc4a09Dd3DcC7D95e0bD525eff7f2968514dE23b2',
  ],
  base: [
    '0x260000459E0D1C46ADE027e552ADc911E0742b50',
    '0x17042A220b138b203f67fDF62fA7aDD8cB16ccAa',
    '0xD111c7DA1eBDf4D2fF2d234A61a806b03187CEC9',
    '0x520411c27a950B731e0D4D5350E0CAEa51b1426F',
  ]
}
const rizMarketExports = {}

Object.keys(rizMarketsConfig).forEach(chain => {
  const pools = rizMarketsConfig[chain]
  rizMarketExports[chain] = {
    tvl: async (api) => {
      for (const pool of pools) {
        await aaveV2Export(pool).tvl(api)
      }
      return api.getBalances()
    },
    borrowed: async (api) => {
      for (const pool of pools) {
        await aaveV2Export(pool).borrowed(api)
      }
      return api.getBalances()
    }
  }
})

module.exports = mergeExports([rizMarketExports, coreMarkets])

module.exports.hallmarks = [
  [1704178500, "flash loan exploit"],
  [Math.floor(new Date('2024-10-16') / 1e3), 'Multisig was compromised'],
]
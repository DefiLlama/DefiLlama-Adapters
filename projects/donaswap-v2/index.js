const { getUniTVL } = require("../helper/unknownTokens.js");

const V2_FACTORY = "0x8e5dff1c121F661971d02950698f8c5EFc3DfA78";
// const HARMONY_V2_FACTORY = "0x8e5dff1c121F661971d02950698f8c5EFc3DfA78"

module.exports = {
  methodology:
  "Factory address (0x8e5dff1c121F661971d02950698f8c5EFc3DfA78) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  arbitrum: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: V2_FACTORY,
    }),
  },
  astar: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: V2_FACTORY,
    }),
  },
  aurora: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: V2_FACTORY,
    }),
  },
  avax: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: V2_FACTORY,
    }),
  },
  base: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: V2_FACTORY,
    }),
  },
  bsc: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: V2_FACTORY,
    }),
  },
  celo: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: V2_FACTORY,
    }),
  },
  cmp: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: V2_FACTORY,
    }),
  },
  conflux: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: V2_FACTORY,
    }),
  },
  core: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: V2_FACTORY,
    }),
  },
  dogechain: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: V2_FACTORY,
    }),
  },
  ethereum: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: V2_FACTORY,
    }),
  },
  fantom: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: V2_FACTORY,
    }),
  },
  flare: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: V2_FACTORY,
    }),
  },
  fuse: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: V2_FACTORY,
    }),
  },
  fusion: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: V2_FACTORY,
    }),
  },
  // harmony: {
  //   tvl: getUniTVL({
  //     useDefaultCoreAssets: true,
  //     factory: HARMONY_V2_FACTORY,
  //   }),
  // },
  heco: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: V2_FACTORY,
    }),
  },
  kcc: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: V2_FACTORY,
    }),
  },
  kardia: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: V2_FACTORY,
    }),
  },
  kava: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: V2_FACTORY,
    }),
  },
  linea: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: V2_FACTORY,
    }),
  },
  metis: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: V2_FACTORY,
    }),
  },
  moonbeam: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: V2_FACTORY,
    }),
  },
  moonriver: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: V2_FACTORY,
    }),
  },
  optimism: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: V2_FACTORY,
    }),
  },
  palm: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: V2_FACTORY,
    }),
  },
  polygon: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: V2_FACTORY,
    }),
  },
  polygon_zkevm: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: V2_FACTORY,
    }),
  },
  thundercore: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: V2_FACTORY,
    }),
  },
};

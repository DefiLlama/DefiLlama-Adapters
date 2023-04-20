
const { getUniTVL } = require('../helper/unknownTokens')

const factory = {
  bsc: "0xBDEc20d9cdf8E222EDd536268A9883a4C2ca172D",
  fantom: "0xdE08A0860B5971201f4d621B6eD4bb5BFed454be",
  polygon: "0xF301aE81800Aa97f68148531D487696EF939170E",
  arbitrum: "0x3D225a66c4A609634fb2c2d75d30Fd6610EBb1BD",
};

module.exports = {
  methodology: `Uses factory addresses to find and price Liquidity Pools TVL`,
  bsc: {
    tvl: getUniTVL({ factory: factory.bsc, }),
  },
  fantom: {
    tvl: getUniTVL({ factory: factory.fantom, }),
  },
  polygon: {
    tvl: getUniTVL({ factory: factory.polygon, }),
  },
  arbitrum: {
    tvl: getUniTVL({ factory: factory.arbitrum, }),
  },
};




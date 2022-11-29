const { getUniTVL } = require('../helper/unknownTokens')

const factories = {
  heco: "0xb0b670fc1F7724119963018DB0BfA86aDb22d941",
  bsc: "0x3CD1C46068dAEa5Ebb0d3f55F6915B10648062B8",
};

const hecoTvl = getUniTVL({ factory: factories.heco, chain: 'heco', useDefaultCoreAssets: true })

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  /*
  heco: {
    tvl: hecoTvl,
  },
  */
  bsc: {
    tvl: getUniTVL({ factory: factories.bsc, chain: 'bsc', useDefaultCoreAssets: true }),
  },
};

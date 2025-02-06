
const { getUniTVL, } = require('../helper/unknownTokens')
const { staking, } = require('../helper/staking')

const BSC_DEX_FACTORY = "0x3e708fdbe3ada63fc94f8f61811196f1302137ad";
const BSC_MASTER_CHEF = "0xc772955c33088a97d56d0bbf473d05267bc4febb";
const POLYGON_DEX_FACTORY = "0x5ede3f4e7203bf1f12d57af1810448e5db20f46c";
const POLYGON_MASTER_CHEF = "0xca2DeAc853225f5a4dfC809Ae0B7c6e39104fCe5"
const BSC_BREW_ADDRESS = "0x790be81c3ca0e53974be2688cdb954732c9862e1";
const POLYGON_BREW_ADDRESS = "0xb5106A3277718eCaD2F20aB6b86Ce0Fee7A21F09";


module.exports = {
  bsc: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: BSC_DEX_FACTORY,
    }),
    staking: staking(BSC_MASTER_CHEF, BSC_BREW_ADDRESS)
  },
  polygon: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: POLYGON_DEX_FACTORY,
    }),
    staking: staking(POLYGON_MASTER_CHEF, POLYGON_BREW_ADDRESS, 'polygon', `bsc:${BSC_BREW_ADDRESS}`)
  },
};

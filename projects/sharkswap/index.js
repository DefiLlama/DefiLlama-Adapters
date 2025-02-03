const { staking } = require('../helper/staking');
const { sumTokensExport, getUniTVL } = require('../helper/unknownTokens');

// SX (legacy)

const sxTvl = getUniTVL({
  factory: '0x6A482aC7f61Ed75B4Eb7C26cE8cD8a66bd07B88D',
  useDefaultCoreAssets: true,
})

// SXR (current)

const sxrTvl = getUniTVL({
  factory: '0x610CfC3CBb3254fE69933a3Ab19aE1bF2aaaD7C8',
  useDefaultCoreAssets: true,
})

module.exports = {
  sx: {
    tvl: sxTvl,
  },
  sxr: {
    tvl: sxrTvl,
  },
};
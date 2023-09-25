const { getUniTVL } = require('../helper/unknownTokens');
const sdk = require("@defillama/sdk");

module.exports = {
  misrepresentedTokens: true,
  era: {
    tvl: getUniTVL({ factory: '0x48E571C645bbeD451b7C58650E643F534fCaB693', useDefaultCoreAssets: true, hasStablePools: true }),
  },
  methodology: "Counts liquidity in pools",
};
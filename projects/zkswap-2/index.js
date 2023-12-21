const { getUniTVL } = require('../helper/unknownTokens')

const factory = "0xeeE1Af1CE68D280e9cAfD861B7d4af776798F18d";
const zks = "";

module.exports = {
  misrepresentedTokens: true,
  era: { tvl: getUniTVL({ factory, useDefaultCoreAssets: true, }) },
};
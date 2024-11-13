const { getUniTVL } = require('../helper/unknownTokens')

const factory = "0xeeE1Af1CE68D280e9cAfD861B7d4af776798F18d";
const zks = "";

module.exports = {
  hallmarks: [
    [1704844800,"Whale Withdraw"]
  ],
  misrepresentedTokens: true,
  era: { tvl: getUniTVL({ factory, useDefaultCoreAssets: true, }) },
  zkfair: { tvl: getUniTVL({ factory: '0x028e8aB8C7556C7F42315f5afe08bB7392aA6878', useDefaultCoreAssets: true, }) },
};
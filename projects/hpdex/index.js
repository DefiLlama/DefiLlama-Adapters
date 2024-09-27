const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  deadFrom: '2024-09-22',
  misrepresentedTokens: true,
  methodology: "Factory address (0xE1d563BcFD4E2a5A9ce355CC8631421186521aAA) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  hpb: {
    tvl: getUniTVL({
      factory: "0xE1d563BcFD4E2a5A9ce355CC8631421186521aAA",
      useDefaultCoreAssets: true,
    })
  }
};

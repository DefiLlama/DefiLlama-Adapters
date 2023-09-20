const { getUniTVL } = require('../helper/unknownTokens')

const FACTORY = {
  bsc: "0xac653ce27e04c6ac565fd87f18128ad33ca03ba2",
  fantom: "0x991152411A7B5A14A8CF0cDDE8439435328070dF",
  metis: "0xAA1504c878B158906B78A471fD6bDbf328688aeB",
};

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({
      factory: FACTORY.bsc,
      useDefaultCoreAssets: true,
    }),
  },
  fantom: {
    tvl: getUniTVL({
      factory: FACTORY.fantom,
      useDefaultCoreAssets: true,
    }),
  },
  metis: {
    tvl: getUniTVL({
      factory: FACTORY.metis,
      useDefaultCoreAssets: true,
    }),
  },
}

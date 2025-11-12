const ADDRESSES = require('../helper/coreAssets.json')

const KACMasterChefContract = {
  bsc: "0x81b71D0bC2De38e37978E6701C342d0b7AA67D59",
  shiden: "0x293A7824582C56B0842535f94F6E3841888168C8",
};
const KACFactory = {
  bsc: "0xa5e48a6E56e164907263e901B98D9b11CCB46C47",
  shiden: "0xcd8620889c1dA22ED228e6C00182177f9dAd16b7",
};
const KAC = {
  bsc: "0xf96429A7aE52dA7d07E60BE95A3ece8B042016fB",
  shiden: ADDRESSES.harmony.AVAX,
};


const { uniTvlExports } = require('../helper/unknownTokens')
module.exports = uniTvlExports({
  'bsc': KACFactory.bsc,
  'shiden': KACFactory.shiden,
}, {
  staking: {
    bsc: [KACMasterChefContract.bsc, KAC.bsc],
    shiden: [KACMasterChefContract.shiden, KAC.shiden],
  },
})
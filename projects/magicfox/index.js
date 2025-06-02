const { uniTvlExport } = require("../helper/unknownTokens");

module.exports = {
  ...uniTvlExport("bsc", "0xcEDa3234D7D5b36114d886682A399c6d126A03e0", {
    hasStablePools: true,
  }),
  ...uniTvlExport("arbitrum", "0xBd7A8c05D0eB214e3C5cc63D4B77C2Ea38bDe440", {
    hasStablePools: true,
  }),
  ...uniTvlExport("polygon", "0xa2d23C7Ca6D360D5B0b30CaFF79dbBfa242B4811", {
    hasStablePools: true,
  }),
};

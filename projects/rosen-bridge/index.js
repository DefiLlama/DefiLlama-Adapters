const { sumTokensExport } = require("../helper/sumTokens");
const ADDRESSES = require('../helper/coreAssets.json');

module.exports = {
  timetravel: false,
  ergo: {
    tvl: sumTokensExport({
      owners: [
        "nB3L2PD3J4rMmyGk7nnNdESpPXxhPRQ4t1chF8LTXtceMQjKCEgL2pFjPY6cehGjyEFZyHEomBTFXZyqfonvxDozrTtK5JzatD8SdmcPeJNWPvdRb5UxEMXE4WQtpAFzt2veT8Z6bmoWN",
      ],
      tokens: [
        ADDRESSES.null,
        '0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b',
        '9a06d9e545a41fd51eeffc5e20d818073bf820c635e2a9d922269913e0de369d',
        '03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04',
      ]
    }),
  },
  cardano: {
    tvl: sumTokensExport({
      owners: [
        "addr1v8kqhz5lkdxqm8qtkn4lgd9f4890v0j6advjfmk5k9amu4c535lsu",
      ],
      tokens: [
        ADDRESSES.null,
        'a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235484f534b59'
      ]
    }),
  },
};

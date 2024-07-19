const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0xC1Ebd02f738644983b6C4B2d440b8e77DdE276Bd",
          "0x23122da8C581AA7E0d07A36Ff1f16F799650232f",
          "0xB2535b988dcE19f9D71dfB22dB6da744aCac21bf",
          "0xA2e996f0cb33575FA0E36e8f62fCd4a9b897aAd3"
        ],
        fetchCoValentTokens: true,
        blacklistedTokens: [
          "0xe3dbc4f88eaa632ddf9708732e2832eeaa6688ab" // Arbius, bridged whole supply
        ]
      }),
  },
};

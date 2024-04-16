const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0xD8A791fE2bE73eb6E6cF1eb0cb3F36adC9B3F8f9",
          "0xb2b10a289A229415a124EFDeF310C10cb004B6ff",
          "0x7F2b8C31F88B6006c382775eea88297Ec1e3E905",
          "0x6774Bcbd5ceCeF1336b5300fb5186a12DDD8b367",
          "0xb94f7F6ABcb811c5Ac709dE14E37590fcCd975B6",
          "0x6260aF48e8948617b8FA17F4e5CEa2d21D21554B",
          "0xf1AF3b23DE0A5Ca3CAb7261cb0061C0D779A5c7B",
        ],
        fetchCoValentTokens: true,
      }),
  },
};

const { staking } = require("../helper/staking");

module.exports = {
  ethereum: {
    tvl: () => ({}),
    staking: staking(
      [
        "0x0916568854Fc53B720186052d8013D62A0409b47",
        "0x258C3104388f8cd72c8b4336fc536033E6dB764E",
      ],
      ["0x25B4f5D4C314bCD5d7962734936C957B947cb7CF"]
    ),
  },
};

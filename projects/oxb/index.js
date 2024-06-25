const { staking } = require("../helper/staking");

module.exports = {
  bsc: {
    tvl: () => ({}),
    staking: staking(
      "0x2281f53a583b00cb80814ccdffe1544a5274dad2",
      "0x7536c00711E41df6aEBCCa650791107645b6bc52"
    ),
  },
};

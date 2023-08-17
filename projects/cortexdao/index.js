const { staking } = require("../helper/staking");

const cxdAddress = "0x5a56da75c50aa2733f5fa9a2442aaefcbc60b2e6";
const stakingAddress = "0x6021D8e7537d68bCEC9A438b2C134c24Cbcc1ce3";

module.exports = {
  ethereum: {
    tvl: () => ({}),
    staking: staking(stakingAddress, cxdAddress),
  },
  hallmarks: [
    [1651881600, "UST depeg"],
    [1678557600, "USDC depeg"],
  ],
};

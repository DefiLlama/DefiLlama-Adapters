const { staking } = require("./helper/staking.js");

const STAKING = "0x6C6D4753a1107585121599746c2E398cCbEa5119";
const TEMP = "0xA36FDBBAE3c9d55a1d67EE5821d53B50B63A1aB9";

module.exports = {
  ethereum: {
    tvl: () => 0,
    staking: staking(STAKING, TEMP),
  },
  fantom: { tvl: () => 0, }
};

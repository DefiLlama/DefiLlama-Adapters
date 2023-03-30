const { staking } = require('../helper/staking');

const token = "0x53Fd70B568e5C8DACe2cE3c38E650F5924BeB1c1";
const masterchef = "0xA55Cb77E8CeBc3fe517044d0AaA923d541a69e71";

module.exports = {
  arbitrum: {
    tvl: () => 0,
    staking: staking(masterchef, token)
  }
}
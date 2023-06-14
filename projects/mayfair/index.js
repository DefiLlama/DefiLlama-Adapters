const { staking } = require('../helper/staking');

const token = "0xF9DF075716B2D9B95616341DC6bC64c85e56645c";
const masterchef = "0xe401c80962c521E751454Fc1C9ff34014e0b8FFB";

module.exports = {
  arbitrum: {
    tvl: () => 0,
    staking: staking(masterchef, token)
  }
}

const { staking } = require('../helper/staking');

const token = "0xf9df075716b2d9b95616341dc6bc64c85e56645c";
const masterchef = "0x5F54638dade598B9c478EcaB330C3E62861d00C1";

module.exports = {
  arbitrum: {
    tvl: () => 0,
    staking: staking(masterchef, token)
  }
}

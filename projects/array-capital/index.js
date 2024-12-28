const { staking } = require('../helper/staking');

const token = "0x164731cd270daa4a94bc70761e53320e48367b8b";
const masterchef = "0x1b91b24d12C934383f25aa07C2c9C9666accf39e";

module.exports = {
  arbitrum: {
    tvl: () => 0,
    staking: staking(masterchef, token)
  }
}
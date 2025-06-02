const { aaveV2Export } = require('../helper/aave')
const { staking } = require('../helper/staking');

module.exports = {
  klaytn: {
    staking: staking('0x32FE0F8d0BC59836028E80bc2ed94AE8E169344B', '0x946bc715501413b9454bb6a31412a21998763f2d'),
    ...aaveV2Export('0x4B6Ece52D0EF60aE054f45c45D6bA4F7a0C2cC67')
  },
};

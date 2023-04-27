const {  nullAddress,treasuryExports } = require("../helper/treasury");

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
        '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', //  WETH
        '0x432502a764abec914f940916652ce55885323cda',
     ],
    owners: ['0x9f59e27fd6c8d96dfb89da58c0c98bac07e7a21a'],
    ownTokens: ['0xc74fe4c715510ec2f8c61d70d397b32043f55abe'],
  },
})
const ADDRESSES = require('../helper/coreAssets.json')
const {staking} = require('../helper/staking')

//Arbitrum
const ARB_VAULT = '0x832f80e93c77966dd343810c254f10ad58d9876d';
const ARB_DUAL_STAKING = '0x42fa477A24d5471A24b798d5B4d9eC3a2C3dD49a';
const ARB_ROSX =  "0xDC8184ba488e949815d4AAfb35B3c56ad03B4179";

module.exports = {
  arbitrum: {
    staking: staking(
        ARB_DUAL_STAKING,
        [
            ARB_ROSX
        ]
    ),
    tvl: staking(
        ARB_VAULT,
        ADDRESSES.arbitrum.USDC
    )
  },
  hallmarks:[
      ['2023-10-16', "RoseonX Launch"]
  ],
};
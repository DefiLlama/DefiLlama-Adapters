const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking')
const { getUniTVL } = require('../helper/unknownTokens')

const che = ADDRESSES.okexchain.CHE
const cheStaking = "0x9Ab8BCf67fE8d8D2aD27D42Ec2A0fD5C206DAE60"

module.exports = {
  methodology: "Staking is the CHE staked on 0x9Ab8BCf67fE8d8D2aD27D42Ec2A0fD5C206DAE60, tvl is the liquidity on the exchange and the money locked on the pools that distribute CHE",
  okexchain: {
    staking: staking(cheStaking, che),
    tvl: getUniTVL({
      factory: '0x709102921812b3276a65092fe79edfc76c4d4afe',
      useDefaultCoreAssets: true,
    })
  },
};

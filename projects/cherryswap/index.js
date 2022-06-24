const { staking } = require('../helper/staking')
const { getUniTVL } = require('../helper/unknownTokens')

const che = "0x8179d97eb6488860d816e3ecafe694a4153f216c"
const cheStaking = "0x9Ab8BCf67fE8d8D2aD27D42Ec2A0fD5C206DAE60"

module.exports = {
    timetravel: false,
    methodology: "Staking is the CHE staked on 0x9Ab8BCf67fE8d8D2aD27D42Ec2A0fD5C206DAE60, tvl is the liquidity on the exchange and the money locked on the pools that distribute CHE",
    okexchain: {
        staking: staking(cheStaking, che, "okexchain", "okexchain:" + che),
      tvl: getUniTVL({
        factory: '0x709102921812b3276a65092fe79edfc76c4d4afe',
        chain: 'okexchain',
        coreAssets: [
          '0x382bb369d343125bfb2117af9c149795c6c65c50', // tether
          "0xc946daf81b08146b1c7a8da2a851ddf2b3eaaf85", // usdc
          "0x8f8526dbfd6e38e3d8307702ca8469bae6c56c15", // wokt
        ]
      }),
    },
}

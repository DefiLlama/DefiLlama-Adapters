const { staking } = require('../helper/staking')
const { getUniTVL } = require('../helper/unknownTokens')

const che = "0x8179d97eb6488860d816e3ecafe694a4153f216c"
const cheStaking = "0x9Ab8BCf67fE8d8D2aD27D42Ec2A0fD5C206DAE60"

module.exports = {
  methodology: "Staking is the CHE staked on 0x9Ab8BCf67fE8d8D2aD27D42Ec2A0fD5C206DAE60, tvl is the liquidity on the exchange and the money locked on the pools that distribute CHE",
  okexchain: {
    staking: staking(cheStaking, che, "okexchain", "okexchain:" + che),
    tvl: getUniTVL({
      factory: '0x709102921812b3276a65092fe79edfc76c4d4afe',
      chain: 'okexchain',
      coreAssets: [
        "0x8F8526dbfd6E38E3D8307702cA8469Bae6C56C15", // WOKT
        "0x382bB369d343125BfB2117af9c149795C6C65C50", // USDT
        "0x54e4622DC504176b3BB432dCCAf504569699a7fF", // BTCK
        "0xEF71CA2EE68F45B9Ad6F72fbdb33d707b872315C", // ETHK
        "0xdF54B6c6195EA4d948D03bfD818D365cf175cFC2", // OKB
        "0xab0d1578216A545532882e420A8C61Ea07B00B12", // KST
        "0x8179d97eb6488860d816e3ecafe694a4153f216c", // che
      ],
    })
  },
};

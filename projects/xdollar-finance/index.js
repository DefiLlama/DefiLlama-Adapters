const sdk = require("@defillama/sdk");
const { staking } = require('../helper/staking')
const { getLiquityTvl } = require('../helper/liquity')

const optionsStable = { nonNativeCollateralToken: true, abis: { collateralToken: 'address:collTokenAddress', activePool: 'address:stableCollActivePool' } }
const options = { nonNativeCollateralToken: true, abis: { collateralToken: 'address:collToken' } }
const optionsIOTX = { nonNativeCollateralToken: true, abis: { collateralToken: 'address:collTokenAddress' } }

module.exports = {
  iotex: {
    tvl: sdk.util.sumChainTvls([
      ...[
        '0x9831a3BF768f32202bBFA5369F888DC88CB31b41',
        '0x511D2869910ECE987095eCb5aB4b58c38213Ed51',
        '0x0BD0cdBf61975f4Cc3E77f595dA8CE4F5f559D0e',
        '0x705CA68990e63a54C6df0131DBf5e10517abF3ce',
      ].map(i => getLiquityTvl(i, optionsStable)),
      getLiquityTvl('0x366D48c04B0d315acF27Bd358558e92D4e2E9f3D', optionsIOTX),
      getLiquityTvl('0x7204e2f210865aA1854F33B3532ab2DEb386CB59', optionsIOTX),
    ]),
  },
  ethereum: {
    tvl: sdk.util.sumChainTvls([
      getLiquityTvl("0x7ee5175dFBD7c66Aa00043493334845376E43a8a", options),
      getLiquityTvl("0x675CD7d43d7665f851997B7F0f2B0265a213BAB8", options),
      getLiquityTvl("0x1e49892c0d0D4455bbbA633EeDaDd6d26224369e", optionsStable),
    ])
  },
  arbitrum: {
    tvl: getLiquityTvl("0x561d2d58bdad7a723a2cf71e8909a409dc2112ec"),
    staking: staking('0xc3fbc4056689cfab3f23809aa25004899ff4d75a', '0x9eF758aC000a354479e538B8b2f01b917b8e89e7'),
  },
  polygon: {
    tvl: getLiquityTvl("0x68738A47d40C34d890168aB7B612A6f649f395e4"),
    staking: staking('0x3509f19581afedeff07c53592bc0ca84e4855475', '0x3dc7b06dd0b1f08ef9acbbd2564f8605b4868eea'),
  },
  avax: {
    tvl: getLiquityTvl("0x561d2d58bdad7a723a2cf71e8909a409dc2112ec"),
    staking: staking('0x68738a47d40c34d890168ab7b612a6f649f395e4', '0x9ef758ac000a354479e538b8b2f01b917b8e89e7'),
  },
  hallmarks: [
    ['2022-10-30', 'XUSD is no longer counted as part of tvl'],
  ],
};

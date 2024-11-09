const { getLiquityTvl } = require('../helper/liquity')
// const { staking } = require('../helper/staking')
const sdk = require('@defillama/sdk')

module.exports = {
  iotex: {
    tvl: sdk.util.sumChainTvls([
      getLiquityTvl('0x4315BcE6076953571caf1903d15D682727FBD935'),
      getLiquityTvl('0xFF5F4bA96586EDae7E7D838D8770dFB3376Ec245', { nonNativeCollateralToken: true, collateralToken: "0x236f8c0a61dA474dB21B693fB2ea7AAB0c803894" })
    ]),
    // staking: staking('0x037a2e9a464fbA409D0E55600836864B410d6Dd8', '0x6C0bf4b53696b5434A0D21C7D13Aa3cbF754913E'), // disabled as backing of WEN is already counted towards tvl
  },
};

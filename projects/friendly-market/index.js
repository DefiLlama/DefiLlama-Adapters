const { compoundV3Exports } = require('../helper/compoundV3')

module.exports = compoundV3Exports({
  nibiru: {
    markets: [
      '0x37a1efd3a3f37e01a856f836e5f680efed6a1714', // NIBI Market
      '0xb63de139c110468976f105f4f35a66869f45ba00', // USDC Market
      '0xfa5e2c325e482e52cf2a86c394759283feeea3bc', // ETH Market
      '0xf10ed85db0a6e9d9e8dd8df4e227ab55f87a0ec6', // stNIBI Market
    ],
  }
  
})

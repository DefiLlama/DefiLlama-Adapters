const { compoundV3Exports } = require('../helper/compoundV3')

module.exports = compoundV3Exports({
  nibiru: {
    markets: [
      '0x37a1efd3a3f37e01a856f836e5f680efed6a1714', // NIBI Market
      '0xb63de139c110468976f105f4f35a66869f45ba00', // USDC Market
    ],
  }
  
})

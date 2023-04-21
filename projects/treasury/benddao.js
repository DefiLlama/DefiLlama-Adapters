const { nullAddress, treasuryExports } = require("../helper/treasury");

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',//USDC
      '0x4d224452801aced8b2f0aebe155379bb5d594381',//APE
    ],
    owners: ['0x472FcC65Fab565f75B1e0E861864A86FE5bcEd7B'],
    ownTokens: ['0x0d02755a5700414b26ff040e1de35d337df56218'],
  },
})
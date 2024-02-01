const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
      ADDRESSES.ethereum.USDC,//USDC
      '0x4d224452801aced8b2f0aebe155379bb5d594381',//APE
    ],
    owners: ['0x472FcC65Fab565f75B1e0E861864A86FE5bcEd7B'],
    ownTokens: ['0x0d02755a5700414b26ff040e1de35d337df56218'],
  },
})
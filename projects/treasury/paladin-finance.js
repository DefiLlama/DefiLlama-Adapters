const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xb95A4779CceDc53010EF0df8Bf8Ed6aEB0E8c2B2";
const treasury1 = "0x1Ae6DCBc88d6f81A7BCFcCC7198397D776F3592E";
const treasurypolygon = "0x6F09B0Cc885f176B06311bD085055A9275957248"

const PAL = "0xab846fb6c81370327e784ae7cbb6d6a6af6ff4bf";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.CRV,
        ADDRESSES.ethereum.USDC,
        '0xba100000625a3754423978a60c9317c58a424e3D',//BAL
        ADDRESSES.ethereum.cvxCRV,
        '0x6DEA81C8171D0bA574754EF6F8b412F2Ed88c54D',//LQTY
        '0x41D5D79431A913C4aE7d69a668ecdfE5fF9DFB68',//INV
        '0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF',//ALCX
        '0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F',//SDT
        '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',//3CRV
        '0x4104b135DBC9609Fc1A9490E61369036497660c8',//APY
        ADDRESSES.ethereum.LIDO,

     ],
    owners: [treasury, treasury1, ],
    ownTokens: [PAL],
  },
  // polygon: {
  //   tokens: [
  //       nullAddress,
  //   ]
  // }
})

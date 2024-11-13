const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xb95A4779CceDc53010EF0df8Bf8Ed6aEB0E8c2B2";
const treasury1 = "0x1Ae6DCBc88d6f81A7BCFcCC7198397D776F3592E";
const treasury2 = "0x0482a2d6e2f895125b7237de70c675cd55fe17ca";
const treasuryarb = "0x8E4aD455225Dae1A78AB375FCb9eD9d94A4BE859"
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
        '0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF',//AURA
        '0xCdF7028ceAB81fA0C6971208e83fa7872994beE5',//T
        '0x30D20208d987713f46DFD34EF128Bb16C404D10f',//SD
        '0x875773784Af8135eA0ef43b5a374AaD105c5D39e',//IDLE
        '0x15f74458aE0bFdAA1a96CA1aa779D715Cc1Eefe4',//GRAI
        '0xBa3335588D9403515223F109EdC4eB7269a9Ab5D',//GEAR

     ],
    owners: [treasury, treasury1, treasury2],
    ownTokens: [PAL],
  },
  arbitrum: {
    tokens: [
      nullAddress,
      '0x1509706a6c66CA549ff0cB464de88231DDBe213B',//AURA
      '0x040d1EdC9569d4Bab2D15287Dc5A4F10F56a56B8',//BAL
      '0xf0cb2dc0db5e6c66B9a70Ac27B06b878da017028',//OHM
      ADDRESSES.arbitrum.ARB,//ARB
    ],
    owners: [treasuryarb]
  }
  // polygon: {
  //   tokens: [
  //       nullAddress,
  //   ]
  // }
})

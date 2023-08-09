const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const yearnTreasury = "0x93a62da5a14c80f265dabc077fcee437b1a0efde";
const yearnTreasury1 = "0xFEB4acf3df3cDEA7399794D0869ef76A6EfAff52";
const yearnTreasuryarb = "0xb6bc033d34733329971b938fef32fad7e98e56ad";

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.DAI,
        '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',//3crv
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.CRV,
        '0xba100000625a3754423978a60c9317c58a424e3D',//BAL
        '0x31429d1856aD1377A8A0079410B297e1a9e214c2',//ANGLE
        ADDRESSES.ethereum.sUSD,
        ADDRESSES.ethereum.WBTC,
     ],
    owners: [yearnTreasury,yearnTreasury1],
    ownTokens: [ADDRESSES.ethereum.YFI],
    fetchTokens: true,
  },
  arbitrum: {
    tokens: [
      nullAddress
    ],
    owners: [yearnTreasuryarb]
  }
})
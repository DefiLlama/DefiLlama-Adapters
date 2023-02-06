const {  nullAddress,treasuryExports } = require("../helper/treasury");

const pullTreasury = "0x42cd8312D2BCe04277dD5161832460e95b24262E";

const POOL = "0x0cEC1A9154Ff802e7934Fc916Ed7Ca50bDE6844e";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',//USDC
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',//DAI
        '0x028171bCA77440897B824Ca71D1c56caC55b68A3',//aDAI
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',//WETH
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',//USDT
        '0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F',//GTC
        '0x4da27a545c0c5B758a6BA100e3a049001de870f5',//stkAAVE
     ],
    owners: [pullTreasury],
    ownTokenOwners: [pullTreasury],
    ownTokens: [POOL],
  },
})
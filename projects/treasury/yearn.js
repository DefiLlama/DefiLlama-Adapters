const {  nullAddress,treasuryExports } = require("../helper/treasury");

const yearnTreasury = "0x93a62da5a14c80f265dabc077fcee437b1a0efde";
const YEARN = "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',// UNI
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',//USDC
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',//DAI
        '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',//3crv
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',//WETH
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',//USDT
        '0xD533a949740bb3306d119CC777fa900bA034cd52',//CRV
        '0xba100000625a3754423978a60c9317c58a424e3D',//BAL
        '0x31429d1856aD1377A8A0079410B297e1a9e214c2',//ANGLE
        '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51',//sUSD
     ],
    owners: [yearnTreasury],
    ownTokens: [YEARN],
  },
})
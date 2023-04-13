const {  nullAddress,treasuryExports } = require("../helper/treasury");

const mStableTreasury1 = "0x3dd46846eed8D147841AE162C8425c08BD8E1b41";

const META = "0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2";
const mUSD = "0xe2f2a5C287993345a840Db3B0845fbC70f5935a5";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',//USDC
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',//DAI
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',//WETH
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',//USDT
        '0xc00e94Cb662C3520282E6f5717214004A7f26888',//COMP
        '0x4da27a545c0c5B758a6BA100e3a049001de870f5',//stkAAVE
        '0x7C07F7aBe10CE8e33DC6C5aD68FE033085256A84',//icETH
        '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72',//ENS
        '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',//UNI
        '0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF',//AURA
        '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',//stETH
     ],
    owners: [mStableTreasury1],
    ownTokens: [META, mUSD],
  },
})
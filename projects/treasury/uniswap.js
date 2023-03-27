const {  nullAddress,treasuryExports } = require("../helper/treasury");

const uniTreasury1 = "0x1a9c8182c09f50c8318d769245bea52c32be35bc";
const uniTreasury2 = "0x4b4e140D1f131fdaD6fb59C13AF796fD194e4135";
const uniTreasury3 = "0x3D30B1aB88D487B0F3061F40De76845Bec3F1e94";

const UNI = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',//USDC
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',//DAI
        '0x028171bCA77440897B824Ca71D1c56caC55b68A3',//aDAI
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',//WETH
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',//USDT
     ],
    owners: [uniTreasury1, uniTreasury2, uniTreasury3],
    ownTokens: [UNI],
  },
})
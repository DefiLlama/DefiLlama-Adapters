const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const uniTreasury1 = "0x1a9c8182c09f50c8318d769245bea52c32be35bc";
const uniTreasury2 = "0x4b4e140D1f131fdaD6fb59C13AF796fD194e4135";
const uniTreasury3 = "0x3D30B1aB88D487B0F3061F40De76845Bec3F1e94";

const UNI = ADDRESSES.ethereum.UNI;


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
      nullAddress,
      ADDRESSES.ethereum.USDC,//USDC
      ADDRESSES.ethereum.DAI,//DAI
      '0x028171bCA77440897B824Ca71D1c56caC55b68A3',//aDAI
      ADDRESSES.ethereum.WETH,//WETH
      ADDRESSES.ethereum.USDT,//USDT
    ],
    fetchCoValentTokens: false,
    owners: [uniTreasury1, uniTreasury2, uniTreasury3],
    ownTokens: [UNI],
  },
})
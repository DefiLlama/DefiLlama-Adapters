const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xF06016D822943C42e3Cb7FC3a6A3B1889C1045f8";
const treasury2 = "0xcCb2656afB1Cc4cB130e8C8C903ad674069c6FCD";

const treasuryOP = "0xd2D4e9024D8C90aB52032a9F1e0d92D4cE20191B";
const treasuryOP2 = "0x2f593f151aF4bb9A71bcA6cAce1d3c56C2844117";

const treasuryARB = "0xc5adb3d91329e1600cbf573485b1d3207bcf6de2"

const LQTY = "0x6dea81c8171d0ba574754ef6f8b412f2ed88c54d";




module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.DAI,//DAI
        ADDRESSES.ethereum.LUSD,//LUSD
        ADDRESSES.ethereum.USDC,//usdc
        '0xc944E90C64B2c07662A292be6244BDf05Cda44a7',//grt
        '0x41545f8b9472D758bB669ed8EaEEEcD7a9C4Ec29',//fort
     ],
    owners: [treasury, treasury2],
    ownTokens: [LQTY],
  },
  optimism: {
    tokens: [
        nullAddress,
        ADDRESSES.optimism.OP, //OP
        '0x73cb180bf0521828d8849bc8CF2B920918e23032', //USD+
        '0x3c8B650257cFb5f272f799F5e2b4e65093a11a05',//velo
    ],
    owners: [treasuryOP, treasuryOP2],
  },
  arbitrum: {
    tokens: [
        nullAddress,
    ],
    owners: [treasuryARB],
  }
})
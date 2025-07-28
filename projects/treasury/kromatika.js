const { token } = require('@coral-xyz/anchor/dist/cjs/utils');
const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");
const { ethereum } = require('../helper/whitelistedNfts');

const Treasury = "0x8e35cc21fbcade0a5483ce430e0d5456086a36d3";
const opTreasury = "0x05d235d8Ba95bfc457f9a11F64cf869f0f3f60F9";
const ethTreasury = "0xC5bF7A684a0dfCA02A1E603b1d27af0aF523A54F";
const polygonTreasury = "0x59bFbaa9BEB41C1cf3f874529776449852c21f5d";

const KROM = "0x55fF62567f09906A85183b866dF84bf599a4bf70";
const opKROM = "0xF98dCd95217E15E05d8638da4c91125E59590B07";
const ethKROM = "0x3af33bEF05C2dCb3C7288b77fe1C8d2AeBA4d789";
const polygonKROM = "0x14Af1F2f02DCcB1e43402339099A05a5E363b83c";


module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.arbitrum.USDC,
        "0x8971dFb268B961a9270632f28B24F2f637c94244"
     ],
    owners: [Treasury],
    ownTokens: [KROM],
  },
  optimism: {
    tokens: [ 
        nullAddress,
        ADDRESSES.optimism.OP,
     ],
    owners: [opTreasury],
    ownTokens: [opKROM],
  },
  ethereum: {
    owners: [ethTreasury],
    ownTokens: [ethKROM],
  },
  polygon: {
    owners: [polygonTreasury],
    ownTokens: [polygonKROM]
  }
})
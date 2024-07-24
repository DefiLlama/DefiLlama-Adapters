const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const Treasury = "0x8e35cc21fbcade0a5483ce430e0d5456086a36d3";
const opTreasury = "0x05d235d8Ba95bfc457f9a11F64cf869f0f3f60F9";

const KROM = "0x55fF62567f09906A85183b866dF84bf599a4bf70";
const opKROM = "0xF98dCd95217E15E05d8638da4c91125E59590B07";


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
})
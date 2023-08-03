const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const Treasury = "0x8e35cc21fbcade0a5483ce430e0d5456086a36d3";

const KROM = "0x55fF62567f09906A85183b866dF84bf599a4bf70";


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
})
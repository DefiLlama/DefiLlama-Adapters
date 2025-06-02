const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xc897b98272aa23714464ea2a0bd5180f1b8c0025";
const vestingAddress = "0xd1DE3F9CD4AE2F23DA941a67cA4C739f8dD9Af33";
const MET = "0x2Ebd53d035150f328bd754D6DC66B99B0eDB89aa";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0x64351fC9810aDAd17A690E4e1717Df5e7e085160',//msETH
        ADDRESSES.ethereum.USDC,//usdc
        ADDRESSES.ethereum.DAI,//dai
        ADDRESSES.ethereum.WETH,//weth
        '0x1b40183EFB4Dd766f11bDa7A7c3AD8982e998421',//vsp
     ],
    owners: [treasury, vestingAddress],
    ownTokens: [MET],
  },
})
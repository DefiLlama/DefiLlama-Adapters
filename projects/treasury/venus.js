const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const venusTreasury = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";

const XVS = "0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63";
const venusBTC = "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B";
const VAI = "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7"


module.exports = treasuryExports({
  bsc: {
    tokens: [ 
        nullAddress,
        ADDRESSES.bsc.USDT,//bsc-usdc
        ADDRESSES.bsc.USDC,//usdc
        ADDRESSES.bsc.BTCB,//BTCB
        '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',//DAI
        ADDRESSES.bsc.BETH,//BETH

     ],
    owners: [venusTreasury],
    ownTokens: [XVS, venusBTC, VAI],
  },
})
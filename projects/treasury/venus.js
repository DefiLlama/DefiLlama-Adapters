const {  nullAddress,treasuryExports } = require("../helper/treasury");

const venusTreasury = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";

const XVS = "0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63";
const venusBTC = "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B";
const VAI = "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7"


module.exports = treasuryExports({
  bsc: {
    tokens: [ 
        nullAddress,
        '0x55d398326f99059fF775485246999027B3197955',//bsc-usdc
        '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',//usdc
        '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',//BTCB
        '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',//DAI
        '0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B',//BETH

     ],
    owners: [venusTreasury],
    ownTokens: [XVS, venusBTC, VAI],
  },
})
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x4441776e6A5D61fA024A5117bfc26b953Ad1f425";
const treasury1 = "0xD0A7A8B98957b9CD3cFB9c0425AbE44551158e9e";
const treasury2 = "0x042B32Ac6b453485e357938bdC38e0340d4b9276"
const BADGER= "0x3472A5A71965499acd81997a54BBA8D852C6E53d";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",//USDC
        "0x9ff58f4fFB29fA2266Ab25e75e2A8b3503311656",//aWBTC
        "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",//WBTC´
        "0xBA485b556399123261a5F9c95d413B4f93107407",//graviAURA
        "0x62B9c7356A2Dc64a1969e19C23e4f579F9810Aa7",// cvxCRV
        "0x4da27a545c0c5B758a6BA100e3a049001de870f5",//stkAAVE
        "0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F",//GTC
        "0x798D1bE841a82a273720CE31c822C61a67a601C3",//DIG
        "0xae78736Cd615f374D3085123A210448E74Fc6393",//rETH
        "0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF",//AURA´
     ],
    owners: [treasury, treasury1, treasury2],
    ownTokens: [BADGER],
  },
})
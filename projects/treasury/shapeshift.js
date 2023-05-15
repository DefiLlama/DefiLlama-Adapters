const {  nullAddress,treasuryExports } = require("../helper/treasury");

const shaTreasury = "0x90A48D5CF7343B08dA12E067680B4C6dbfE551Be";

const LP = "0x470e8de2eBaef52014A47Cb5E6aF86884947F08c"
const FOX = "0xc770EEfAd204B5180dF6a14Ee197D99d808ee52d";
const tFOX = "0x808D3E6b23516967ceAE4f17a5F9038383ED5311"


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',//USDC
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',//DAI
        '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0',//LUSD
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',//WETH
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',//USDT
        '0x6f80310CA7F2C654691D1383149Fa1A57d8AB1f8',//SILO
        '0x2e9d63788249371f1DFC918a52f8d799F4a38C94',//TOKE
     ],
    owners: [shaTreasury],
    ownTokens: [FOX, LP, tFOX],
  },
})
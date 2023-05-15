const { simulateTransaction } = require("@project-serum/anchor/dist/cjs/utils/rpc");
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const treasury = "0xdff2aea378e41632e45306a6de26a7e0fd93ab07";
const treasury2 = "0xe1f03b7b0ebf84e9b9f62a1db40f1efb8faa7d22"

const SILO = "0x6f80310CA7F2C654691D1383149Fa1A57d8AB1f8"


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',//USDC
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',//DAI
        '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0',//LUSD
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',//WETH
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',//USDT
        '0x2e9d63788249371f1DFC918a52f8d799F4a38C94',//TOKE
     ],
    owners: [treasury, treasury2],
    ownTokens: [SILO],
  },
})
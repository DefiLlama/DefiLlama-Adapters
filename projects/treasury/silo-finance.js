const ADDRESSES = require('../helper/coreAssets.json')
const { simulateTransaction } = require("@project-serum/anchor/dist/cjs/utils/rpc");
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const treasury = "0xdff2aea378e41632e45306a6de26a7e0fd93ab07";
const treasury2 = "0xe1f03b7b0ebf84e9b9f62a1db40f1efb8faa7d22"

const SILO = "0x6f80310CA7F2C654691D1383149Fa1A57d8AB1f8"


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,//USDC
        ADDRESSES.ethereum.DAI,//DAI
        ADDRESSES.ethereum.LUSD,//LUSD
        ADDRESSES.ethereum.WETH,//WETH
        ADDRESSES.ethereum.USDT,//USDT
        ADDRESSES.ethereum.TOKE,//TOKE
     ],
    owners: [treasury, treasury2],
    ownTokens: [SILO],
  },
})
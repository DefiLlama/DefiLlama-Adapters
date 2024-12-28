const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const treasury = "0x3dd46846eed8D147841AE162C8425c08BD8E1b41";
const treasury2 = "0xfcf455d6eb48b3289a712c0b3bc3c7ee0b0ee4c6"
const treasury3 = "0xf6ff1f7fceb2ce6d26687eaab5988b445d0b94a2"
const treasury4 = "0x67905d3e4fec0c85dce68195f66dc8eb32f59179"

const META = "0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2";
const mUSD = "0xe2f2a5C287993345a840Db3B0845fbC70f5935a5";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,//USDC
        ADDRESSES.ethereum.DAI,//DAI
        ADDRESSES.ethereum.WETH,//WETH
        ADDRESSES.ethereum.USDT,//USDT
        '0xc00e94Cb662C3520282E6f5717214004A7f26888',//COMP
        '0x4da27a545c0c5B758a6BA100e3a049001de870f5',//stkAAVE
        '0x7C07F7aBe10CE8e33DC6C5aD68FE033085256A84',//icETH
        '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72',//ENS
        ADDRESSES.ethereum.UNI,//UNI
        '0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF',//AURA
        ADDRESSES.ethereum.STETH,//stETH
     ],
    owners: [treasury, treasury2, treasury3, treasury4],
    ownTokens: [META, mUSD],
  },
})
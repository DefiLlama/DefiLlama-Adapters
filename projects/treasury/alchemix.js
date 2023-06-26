const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const alchemixTreasury = "0x8392F6669292fA56123F71949B52d883aE57e225";
const ALCX = "0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF";
const operations_treasury = "0x9e2b6378ee8ad2A4A95Fe481d63CAba8FB0EBBF9"
const treasury2 = "0x9735F7d3Ea56b454b24fFD74C58E9bD85cfaD31B"
const treasury3 = "0xe761bf731A06fE8259FeE05897B2687D56933110"
const treasury4 = "0x06378717d86B8cd2DBa58c87383dA1EDA92d3495"
const treasury5 = "0x3216D2A52f0094AA860ca090BC5C335dE36e6273"

const treasuryFTM = "0x6b291cf19370a14bbb4491b01091e1e29335e605"
const treasuryOP = "0xc224bf25dcc99236f00843c7d8c4194abe8aa94a"


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,//USDC
        ADDRESSES.ethereum.DAI,//DAI
        '0x028171bCA77440897B824Ca71D1c56caC55b68A3',//aDAI
        ADDRESSES.ethereum.WETH,//WETH
        ADDRESSES.ethereum.USDT,//USDT
        "0xf16aEe6a71aF1A9Bc8F56975A4c2705ca7A782Bc", //20WETH-80ALC
        ADDRESSES.ethereum.LUSD,
        ADDRESSES.ethereum.CRV,
        ADDRESSES.ethereum.YFI,
        "0xa258C4606Ca8206D8aA700cE2143D7db854D168c",
        "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0",
        "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490",
        "0xF1bB87563A122211d40d393eBf1c633c330377F9", //xpremia
        "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0",
        "0x7f50786A0b15723D741727882ee99a0BF34e3466"
     ],
    owners: [alchemixTreasury, operations_treasury, treasury2, treasury3, treasury4, treasury5], 
    ownTokens: [ALCX],
  },
  optimism: {
    tokens: [ 
        nullAddress,
        ADDRESSES.optimism.USDC,//USDC
        ADDRESSES.optimism.OP,
        "0x3c8B650257cFb5f272f799F5e2b4e65093a11a05"
     ],
    owners: [treasuryOP], 
  },
  fantom: {
    tokens: [ 
        nullAddress,
        ADDRESSES.fantom.USDC,//USDC
        ADDRESSES.fantom.DAI,
        ADDRESSES.fantom.WFTM
     ],
    owners: [treasuryFTM], 
  },
})

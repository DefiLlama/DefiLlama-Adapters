const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const arbtreasury = "0x1d9bfc24d9e7eeda4119ceca11eaf4c24e622e62";
const arbtreasury2 = "0x940279D22EB27415F2b0A0Ee6287749b5B19F43D";
const arbSYN = "0x080F6AEd32Fc474DD5717105Dba5ea57268F46eb"
//const AuroraTreasury = "0xbb227Fcf45F9Dc5deF87208C534EAB1006d8Cc8d";
const avaxTreasury = "0xd7aDA77aa0f82E6B3CF5bF9208b0E5E1826CD79C";
const avaxSYN = "0x1f1E7c893855525b303f99bDF5c3c05Be09ca251"
//const bobaTreasury = "0xbb227Fcf45F9Dc5deF87208C534EAB1006d8Cc8d";
const bscTreasury = "0xA316d83e67EEfD136f4C077de1cD4163A681F8A8";
//const CantoTreasury = "0x02BA7A3Cd181a103Ba5702e708cF22de4Fa70254"
//const CronosTreasury = "0x7f91f3111b2009eC7c079Be213570330a37e8aeC"
//const DFKTreasury = "0x2E62c47f502f512C75bd5Ecd70799EFB0Fe7BAA3"
//const DogechainTreasury = "0x8f17b483982d1cc09296aed8f1b09ad830358a8d"
const FantomTreasury = "0x224002428cF0BA45590e0022DF4b06653058F22F"
const fantomSYN = "0xE55e19Fb4F2D85af758950957714292DAC1e25B2"
const HarmonyTreasury = "0x0172e7190Bbc0C2Aa98E4d1281d41D0c07178605"
//const KlaytnTreasury = "0x8f17b483982d1cc09296aed8f1b09ad830358a8d"
const MainnetTreasury = "0x67F60b0891EBD842Ebe55E4CCcA1098d7Aac1A55"
const mainnetSYN = "0x0f2D719407FdBeFF09D87557AbB7232601FD9F29"
const mainnetsynethLP = "0x4A86C01d67965f8cB3d0AAA2c655705E64097C31"
const MetisTreasury = "0xEAEC50eBe1c2A981ED8be02C36b0863Fae322975"
const metisSYN = ADDRESSES.metis.SYN
//const MoonbeamTreasury = "0xbb227Fcf45F9Dc5deF87208C534EAB1006d8Cc8d"
//const MoonriverTreasury = "0x4bA30618fDcb184eC01a9B3CAe258CFc5786E70E"
const OptimismTreasury = "0x2431CBdc0792F5485c4cb0a9bEf06C4f21541D52"
const PolygonTreasury = "0xBdD38B2eaae34C9FCe187909e81e75CBec0dAA7A"
const polygonSYN = "0xf8F9efC0db77d8881500bb06FF5D6ABc3070E695"

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
        //"0x080F6AEd32Fc474DD5717105Dba5ea57268F46eb",//syn
        ADDRESSES.arbitrum.WETH,
        ADDRESSES.optimism.DAI,
        ADDRESSES.arbitrum.nUSD,
        ADDRESSES.arbitrum.USDT,
        ADDRESSES.arbitrum.USDC,
     ],
    owners: [arbtreasury, arbtreasury2],
    ownTokens: [arbSYN]
  },
  avax: {
    tokens: [
      nullAddress,
      //"0x1f1E7c893855525b303f99bDF5c3c05Be09ca251",//syn
      ADDRESSES.avax.WAVAX,
      ADDRESSES.avax.DAI,
      ADDRESSES.avax.USDC_e,
      ADDRESSES.avax.USDT_e,

    ],
    owners: [avaxTreasury],
    ownTokens: [avaxSYN]
  },
  bsc: {
    tokens: [
      nullAddress,
      ADDRESSES.bsc.USDC,
      ADDRESSES.bsc.BUSD,
      ADDRESSES.fantom.fUSDT,
      ADDRESSES.bsc.BTCB,
      "0x54261774905f3e6E9718f2ABb10ed6555cae308a",//anybtc
      "0x42F6f551ae042cBe50C739158b4f0CAC0Edb9096",//nrv
      ADDRESSES.bsc.USDT,
      "0x23396cF899Ca06c4472205fC903bDB4de249D6fC",//ustc
    ],
    owners: [bscTreasury]
  },
  fantom: {
    tokens: [
      nullAddress,
      //"0xE55e19Fb4F2D85af758950957714292DAC1e25B2",//syn
      "0x74b23882a30290451A17c44f4F05243b6b58C76d",//eth
      ADDRESSES.fantom.USDC,
      ADDRESSES.fantom.WFTM,
    ],
    owners: [FantomTreasury],
    ownTokens: [fantomSYN]
  },
  harmony: {
    tokens: [
      nullAddress
    ],
    owners: [HarmonyTreasury]
  },
  ethereum: {
    tokens: [
      nullAddress,
      //"0x0f2D719407FdBeFF09D87557AbB7232601FD9F29",//syn
      ADDRESSES.ethereum.USDC,
      "0x0ab87046fBb341D058F17CBC4c1133F25a20a52f",//gohm
      ADDRESSES.ethereum.FRAX,
      ADDRESSES.ethereum.WETH,
      ADDRESSES.ethereum.DAI,
      ADDRESSES.ethereum.USDT,
      "0x98585dFc8d9e7D48F0b1aE47ce33332CF4237D96",//newo
      "0x71Ab77b7dbB4fa7e017BC15090b2163221420282",//high
      ADDRESSES.ethereum.WBTC,
      "0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F",//sdt
      "0xBAac2B4491727D78D2b78815144570b9f2Fe8899",//dog
      "0x02B5453D92B730F29a86A0D5ef6e930c4Cf8860B",//usdb
      "0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8",//ageur
      "0x0642026E7f0B6cCaC5925b4E7Fa61384250e1701",//h2o
      "0xb753428af26E81097e7fD17f40c88aaA3E04902c",//sfi
      ADDRESSES.ethereum.LINK,
    ],
    owners: [MainnetTreasury],
    ownTokens: [mainnetSYN, mainnetsynethLP]
  },
  metis: {
    tokens: [
      nullAddress,
      //ADDRESSES.metis.SYN,
      "0xFB21B70922B9f6e3C6274BcD6CB1aa8A0fe20B80",//gohm
      ADDRESSES.metis.m_USDC,
    ],
    owners: [MetisTreasury],
    ownTokens: [metisSYN]
  },
  optimism: {
    tokens: [
      nullAddress,
      ADDRESSES.optimism.OP,
      "0x809DC529f07651bD43A172e8dB6f4a7a0d771036",//neth
    ],
    owners: [OptimismTreasury]
  },
  polygon: {
    tokens: [
      nullAddress,
      ADDRESSES.polygon.USDC,
      ADDRESSES.polygon.USDT,
      ADDRESSES.polygon.WMATIC_2,
      ADDRESSES.polygon.DAI,
      "0xd8cA34fd379d9ca3C6Ee3b3905678320F5b45195",//gohm
      //"0xf8F9efC0db77d8881500bb06FF5D6ABc3070E695",//syn
    ],
    owners: [PolygonTreasury],
    ownTokens: [polygonSYN]
  }
})
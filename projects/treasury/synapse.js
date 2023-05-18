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
const metisSYN = "0x67C10C397dD0Ba417329543c1a40eb48AAa7cd00"
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
        "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",//weth
        "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",//dai
        "0x2913E812Cf0dcCA30FB28E6Cac3d2DCFF4497688",//nusd
        "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",//tether
        "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",//usdc
     ],
    owners: [arbtreasury, arbtreasury2],
    ownTokens: [arbSYN]
  },
  avax: {
    tokens: [
      nullAddress,
      //"0x1f1E7c893855525b303f99bDF5c3c05Be09ca251",//syn
      "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",//wavax
      "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",//dai
      "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",//usdc
      "0xc7198437980c041c805A1EDcbA50c1Ce5db95118",//tether

    ],
    owners: [avaxTreasury],
    ownTokens: [avaxSYN]
  },
  bsc: {
    tokens: [
      nullAddress,
      "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",//usdc
      "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",//busd
      "0x049d68029688eAbF473097a2fC38ef61633A3C7A",//fusdt
      "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",//btcb
      "0x54261774905f3e6E9718f2ABb10ed6555cae308a",//anybtc
      "0x42F6f551ae042cBe50C739158b4f0CAC0Edb9096",//nrv
      "0x55d398326f99059fF775485246999027B3197955",//bsc-usd
      "0x23396cF899Ca06c4472205fC903bDB4de249D6fC",//ustc
    ],
    owners: [bscTreasury]
  },
  fantom: {
    tokens: [
      nullAddress,
      //"0xE55e19Fb4F2D85af758950957714292DAC1e25B2",//syn
      "0x74b23882a30290451A17c44f4F05243b6b58C76d",//eth
      "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",//usdc
      "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",//wftm
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
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",//usdc
      "0x0ab87046fBb341D058F17CBC4c1133F25a20a52f",//gohm
      "0x853d955aCEf822Db058eb8505911ED77F175b99e",//frax
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",//weth
      "0x6B175474E89094C44Da98b954EedeAC495271d0F",//dai
      "0xdAC17F958D2ee523a2206206994597C13D831ec7",//tether
      "0x98585dFc8d9e7D48F0b1aE47ce33332CF4237D96",//newo
      "0x71Ab77b7dbB4fa7e017BC15090b2163221420282",//high
      "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",//wbtc
      "0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F",//sdt
      "0xBAac2B4491727D78D2b78815144570b9f2Fe8899",//dog
      "0x02B5453D92B730F29a86A0D5ef6e930c4Cf8860B",//usdb
      "0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8",//ageur
      "0x0642026E7f0B6cCaC5925b4E7Fa61384250e1701",//h2o
      "0xb753428af26E81097e7fD17f40c88aaA3E04902c",//sfi
      "0x514910771AF9Ca656af840dff83E8264EcF986CA",//link
    ],
    owners: [MainnetTreasury],
    ownTokens: [mainnetSYN, mainnetsynethLP]
  },
  metis: {
    tokens: [
      nullAddress,
      //"0x67C10C397dD0Ba417329543c1a40eb48AAa7cd00",//syn
      "0xFB21B70922B9f6e3C6274BcD6CB1aa8A0fe20B80",//gohm
      "0xEA32A96608495e54156Ae48931A7c20f0dcc1a21",//usdc
    ],
    owners: [MetisTreasury],
    ownTokens: [metisSYN]
  },
  optimism: {
    tokens: [
      nullAddress,
      "0x4200000000000000000000000000000000000042",//op
      "0x809DC529f07651bD43A172e8dB6f4a7a0d771036",//neth
    ],
    owners: [OptimismTreasury]
  },
  polygon: {
    tokens: [
      nullAddress,
      "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",//usdc
      "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",//usdt
      "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",//wmatic
      "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",//dai
      "0xd8cA34fd379d9ca3C6Ee3b3905678320F5b45195",//gohm
      //"0xf8F9efC0db77d8881500bb06FF5D6ABc3070E695",//syn
    ],
    owners: [PolygonTreasury],
    ownTokens: [polygonSYN]
  }
})
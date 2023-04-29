const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports, getComplexTreasury } = require("../helper/treasury");

//eth
const Treasury1 = "0x1c46450211cb2646cc1da3c5242422967ed9e04c";
const Treasury2 = "0x355d72fb52ad4591b2066e43e89a7a38cf5cb341";

//avax
const TreasuryAVAX = "0x88bbe6de858b179841c8f49a56b99fb0522a263a"

const TIME = "0xb54f16fb19478766a268f172c9480f8da1a7c9c3"

// arbitrum

const TreasuryArbitrum = "0x32b5d1f1331f857d583b05ef50ab9636cdc090d9"

//polygon

const TreasuryPolygon = "0x1de8a4c781ac134c1a7640aabe5929f4e1fe2f5b"

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,//USDC
        ADDRESSES.ethereum.DAI,//DAI
        '0x028171bCA77440897B824Ca71D1c56caC55b68A3',//aDAI
        ADDRESSES.ethereum.WETH,//WETH
        ADDRESSES.ethereum.USDT,//USDT
        '0xFcF8eda095e37A41e002E266DaAD7efC1579bc0A',//flex
        '0xdB25f211AB05b1c97D595516F45794528a807ad8',//eurs
        '0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6',//stg
        '0x29127fe04ffa4c32acac0ffe17280abd74eac313',//sifu
     ],
    owners: [Treasury1, Treasury2],
  },
  avax: {
    tokens: [
       nullAddress,
       ADDRESSES.avax.USDT_e,//usdte
       "0x39fC9e94Caeacb435842FADeDeCB783589F50f5f",//knc
       "0x63682bdc5f875e9bf69e201550658492c9763f89",//bsgg
    ],
    owners: [TreasuryAVAX],
    ownTokens: [TIME],
  },
 arbitrum: {
  tokens: [
     nullAddress,
     ADDRESSES.arbitrum.WETH,//weth
     ADDRESSES.arbitrum.GMX,//gmx
     "0xd2D1162512F927a7e282Ef43a362659E4F2a728F",//sbfGMX
  ],
  owners: [TreasuryArbitrum]
 },
 polygon: {
  tokens: [
     nullAddress,
     "0xb08b3603C5F2629eF83510E6049eDEeFdc3A2D91",//cpool
  ],
  owners: [TreasuryPolygon]
 }
})

// Sources: https://wl-l.ink/Zapper/Treasury and https://docs.wonderland.money/ecosystem/contracts
const treasuries = [
   "0x1c46450211cb2646cc1da3c5242422967ed9e04c","0x355d72fb52ad4591b2066e43e89a7a38cf5cb341","0xb6b80f4ea8fb4117928d3c819e8ac6f1a3837baf",
   "0x88bbe6de858b179841c8f49a56b99fb0522a263a","0x32b5d1f1331f857d583b05ef50ab9636cdc090d9","0x1de8a4c781ac134c1a7640aabe5929f4e1fe2f5b",
   "0x694497072b2c43b737ae70bbd52694d61377344c","0x004016b53f127c8f6f64cbf66330765dcf5dbe2a","0xb96e3bf7d8939e9e17adcc26fdf47b6c7391eb6a",
   "0xba90fabdde85191ae04bfdd8022f6d7b1f86c2f4","0x5a4a936e90caf09590ac402b6e8d5435a5092a7a","0x1724b987feb9651c466d9e66be4b74a7cedbf372"
]

//getComplexTreasury(treasuries)
const {  nullAddress,treasuryExports } = require("../helper/treasury");

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
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',//USDC
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',//DAI
        '0x028171bCA77440897B824Ca71D1c56caC55b68A3',//aDAI
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',//WETH
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',//USDT
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
       "0xc7198437980c041c805A1EDcbA50c1Ce5db95118",//usdte
       "0x39fC9e94Caeacb435842FADeDeCB783589F50f5f",//knc
       "0x63682bdc5f875e9bf69e201550658492c9763f89",//bsgg
    ],
    owners: [TreasuryAVAX],
    ownTokens: [TIME],
  },
 arbitrum: {
  tokens: [
     nullAddress,
     "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",//weth
     "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a",//gmx
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
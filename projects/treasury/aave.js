const { nullAddress, treasuryExports } = require("../helper/treasury");

const aaveTreasury = "0x89c51828427f70d77875c6747759fb17ba10ceb0";
const aaveTreasury1 = "0x464C71f6c2F760DdA6093dCB91C24c39e5d6e18c";
const AAVE = "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',//USDC
        '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',//AAVE
        '0x028171bca77440897b824ca71d1c56cac55b68a3',// aDAI
        '0x3ed3b47dd13ec9a98b44e6204a523e766b225811',// aUSDT
        '0xBcca60bB61934080951369a648Fb03DF4F96263C', // aUSDC
        '0xba100000625a3754423978a60c9317c58a424e3D', //BAL
        '0x030bA81f1c18d280636F32af80b9AAd02Cf0854e', //aWETH
        '0x8dAE6Cb04688C62d939ed9B68d32Bc62e49970b1', //aCRV
        '0x6B175474E89094C44Da98b954EedeAC495271d0F', //DAI
        '0x35f6B052C598d933D69A4EEC4D04c73A191fE6c2', //aSNX
        '0x9ff58f4fFB29fA2266Ab25e75e2A8b3503311656', //aWBTC
        '0xa06bC25B5805d5F8d82847D191Cb4Af5A3e873E0', //aLINK
        '0x272F97b7a56a387aE942350bBC7Df5700f8a4576', //aBAL
     ],
    owners: [aaveTreasury, aaveTreasury1],
    ownTokenOwners: [aaveTreasury],
    ownTokens: [AAVE],
  },
})

//https://dune.com/queries/27231
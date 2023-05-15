const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B";
const treasury2 = "0x6d903f6003cca6255d85cca4d3b5e5146dc33925"
const vestingAddress = "0x2775b1c75658Be0F640272CCb8c72ac986009e38";
const COMP = "0xc00e94Cb662C3520282E6f5717214004A7f26888";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9',//cUSDT
        '0xE41d2489571d322189246DaFA5ebDe1F4699F498',//zrx
        '0x39AA39c021dfbaE8faC545936693aC917d5E7563',//cUSDC
        '0xc00e94Cb662C3520282E6f5717214004A7f26888',
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        '0x6B175474E89094C44Da98b954EedeAC495271d0F'
     ],
    owners: [treasury, vestingAddress, treasury2],
    ownTokens: [COMP],
  },
})
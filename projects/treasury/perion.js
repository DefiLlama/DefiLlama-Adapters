const { nullAddress, treasuryExports } = require("../helper/treasury");
const PERC = '0x60bE1e1fE41c1370ADaF5d8e66f07Cf1C2Df2268';
const treasuryContractsETH = [
  "0x12d73bee50f0b9e06b35fdef93e563c965796482", //Perion Treasury 
];

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        '0x60bE1e1fE41c1370ADaF5d8e66f07Cf1C2Df2268', // PERC
        '0x549020a9Cb845220D66d3E9c6D9F9eF61C981102', // SIDIUS
        '0x34Be5b8C30eE4fDe069DC878989686aBE9884470', //SENATE
        '0xdAC17F958D2ee523a2206206994597C13D831ec7', //USDT
     ],
    owners: treasuryContractsETH,
    ownTokens: [PERC],
  },
})

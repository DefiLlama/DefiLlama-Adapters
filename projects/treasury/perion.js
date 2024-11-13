const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");
const PERC = '0x60bE1e1fE41c1370ADaF5d8e66f07Cf1C2Df2268';
const treasuryContractsETH = [
  "0x12d73bee50f0b9e06b35fdef93e563c965796482", //Perion Treasury 
];

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC, // USDC
        ADDRESSES.ethereum.DAI,
        '0x60bE1e1fE41c1370ADaF5d8e66f07Cf1C2Df2268', // PERC
        '0x549020a9Cb845220D66d3E9c6D9F9eF61C981102', // SIDIUS
        '0x34Be5b8C30eE4fDe069DC878989686aBE9884470', //SENATE
        ADDRESSES.ethereum.USDT, //USDT
        ADDRESSES.ethereum.STETH, //stETH
     ],
    owners: treasuryContractsETH,
    ownTokens: [PERC],
  },
})

const { sumERC4626VaultsExport2 } = require('../helper/erc4626')
const PRIZE_VAULTS = [
  '0x9d9a8a51d3f1b2465a9f2d2729405a63fd044a09', // ShiYoUSD
  '0x738b1c666C1ae19adE14a8A73562B655746353B0', // ShiYoETH
  '0x11332d33da296dE34DDa4D0A37ce3303d80f6b61', // ShiYoEUR
  '0x25d99a29463aa85909687985fb58b4406fca7fe3', // ShiYoBTC
];

module.exports = {
  methodology: "TVL is the total assets deposited in Shinjo prize vaults, measured via the ERC4626 totalAssets() function on each vault.",
  base: {
    tvl: sumERC4626VaultsExport2({ vaults: PRIZE_VAULTS}),
  },
};

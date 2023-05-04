const { nullAddress, treasuryExports } = require("../helper/treasury");

const eth = "0x10A19e7eE7d7F8a52822f6817de8ea18204F2e4f";
const polygon = "0xd2bD536ADB0198f74D5f4f2Bd4Fe68Bae1e1Ba80";
const arbitrum = "0x6207ed574152496c9B072C24FD87cE9cd9E17320";
const optimism = "0x043f9687842771b3dF8852c1E9801DCAeED3f6bc";

const bal = "0xba100000625a3754423978a60c9317c58a424e3D";
const abal = "0x272F97b7a56a387aE942350bBC7Df5700f8a4576";

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
      "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", // LDO
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
      "0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F", // GTC
      "0xCFEAead4947f0705A14ec42aC3D44129E1Ef3eD5", // NOTE
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
      "0x2d94AA3e47d9D5024503Ca8491fcE9A2fB4DA198", // BANK
      "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
      "0x226f7b842E0F0120b7E194D05432b3fd14773a9D", // UNN
      "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84", // stETH
      "0x5aFE3855358E112B5647B952709E6165e1c1eEEe", // SAFE
    ],
    owners: [eth],
    ownTokens: [bal, abal],
  },
  arbitrum: {
    owners: ['0xaf23dc5983230e9eeaf93280e312e57539d098d0'],
    tokens: [
      "0x82af49447d8a07e3bd95bd0d56f35241523fbab1", // WETH
      "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", // USDC
    ],
    ownTokens: ['0xbc2597d3f1f9565100582cde02e3712d03b8b0f6'],
  }
});

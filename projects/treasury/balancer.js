const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const eth = "0x10A19e7eE7d7F8a52822f6817de8ea18204F2e4f";
const eth2 = "0xb129f73f1afd3a49c701241f374db17ae63b20eb"

const bal = "0xba100000625a3754423978a60c9317c58a424e3D";
const abal = "0x272F97b7a56a387aE942350bBC7Df5700f8a4576";

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
      ADDRESSES.ethereum.LIDO,
      ADDRESSES.ethereum.USDC,
      "0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F", // GTC
      "0xCFEAead4947f0705A14ec42aC3D44129E1Ef3eD5", // NOTE
      ADDRESSES.ethereum.WETH,
      "0x2d94AA3e47d9D5024503Ca8491fcE9A2fB4DA198", // BANK
      ADDRESSES.ethereum.DAI,
      "0x226f7b842E0F0120b7E194D05432b3fd14773a9D", // UNN
      ADDRESSES.ethereum.STETH,
      ADDRESSES.ethereum.SAFE,
    ],
    owners: [eth, eth2],
    ownTokens: [bal, abal],
  },
  arbitrum: {
    owners: ['0xaf23dc5983230e9eeaf93280e312e57539d098d0'],
    tokens: [
      ADDRESSES.arbitrum.WETH,
      ADDRESSES.arbitrum.USDC,
    ],
    ownTokens: ['0xbc2597d3f1f9565100582cde02e3712d03b8b0f6'],
  }
});

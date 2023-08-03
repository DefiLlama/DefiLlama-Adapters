const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xc671a6b1415de6549b05775ee4156074731190c6";
const uwu = "0x55C08ca52497e2f1534B59E2917BF524D4765257";
module.exports = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
      "0x29127fE04ffa4c32AcAC0fFe17280ABD74eAC313", // SIFU
      ADDRESSES.ethereum.USDT, // USDT
      ADDRESSES.ethereum.DAI, // DAI
      "0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3", // MIM
      ADDRESSES.ethereum.WBTC, // WBTC
      "0xb95BD0793bCC5524AF358ffaae3e38c3903C7626", // uDAI
      "0x24959F75d7BDA1884f1Ec9861f644821Ce233c7D", // uUSDT
      "0x8C240C385305aeb2d5CeB60425AABcb3488fa93d", // uFRAX
      "0x67fadbD9Bf8899d7C578db22D7af5e2E500E13e5", // uWETH
      "0xaDFa5Fa0c51d11B54C8a0B6a15F47987BD500086", // uLUSD
      "0x6Ace5c946a3Abd8241f31f182c479e67A4d8Fc8d", // uWBTC
      "0xC4BF704f51aa4ce1AA946FfE15646f9B271ba0fa", // uWMEMO
      "0xdb1A8f07f6964EFcFfF1Aa8025b8ce192Ba59Eba", // uCRV
      "0xC480a11A524E4DB27c6d4E814b4D9B3646bC12Fc", // uMIM
      "0x02738ef3f8d8D3161DBBEDbda25574154c560dAe", // uSIFU
      "0x8028Ea7da2ea9BCb9288C1F6f603169B8AEa90A6", // uSIFUM
      "0x243387a7036bfcB09f9bF4EcEd1E60765D31aA70", // uSSPELL
    ],
    owners: [treasury],
    ownToken: [uwu],
  },
});

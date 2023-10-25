const { getUniTVL } = require('../helper/unknownTokens')
const { pool2s } = require("../helper/pool2");
const lockedContracts = [
  "0x55602a69eeD9682dd30aaceAAD889c443eF3F93E",
  "0x3Ac400666Ab7b7043e1dAf2c7a28B3A31914dE42",
  "0x0B23Cb245c1211A0C2D05f15841085901325c825",
  "0x097F8aA6592b44c7b273aCf8864D7444d628FEA5",
  "0x03DC2233b54E48DfFe2f9aBF5A8Fd27F22217986",
  "0x20dAF55AC6A606aD048AB3eB9467Fbaa4053122a"
];

const elysiumLP = [
  "0x725C07888D3253Dff26553BA9Fd0BbF316337c9c",
  "0x7DE9E9D34F5d95B1015Cb458Cceb234724d324Ee",
  "0x837CAdaC2eb7eD7c13425749cE3B60178EaF4BB4",
  "0xBcA8f9f778C0D24b40EEbAc3100E219bfE27040d",
  "0xd793131a8B6eC55b79D35EA714b878b74cB246Eb",
  "0x5940ffBbEba220e358b443d7e02C7A907503CFE8"
  
];

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x5bec5d65fAba8E90e4a74f3da787362c60F22DaE) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  elsm: {
    tvl: getUniTVL({ factory: '0x5bec5d65fAba8E90e4a74f3da787362c60F22DaE', useDefaultCoreAssets: true }),
    pool2: pool2s(lockedContracts, elysiumLP, "elysium"),

  },
};

const { sumERC4626VaultsExport } = require("../helper/erc4626")

module.exports = {
  doublecounted: true,
};

const config = {
  ethereum: [
    "0x4D7F26a161a3e1fbE10C11e1c9abC05Fa43DdE67",
    "0x4cba5780Dcbee1c8B5220D24f4F54e14D796a31C",
    "0xD8785CDae9Ec24b8796c45E3a2D0F7b03194F826",
    "0xc2d4d9070236bA4ffefd7cf565eb98d11bFeB8E1",
    "0x2C2f0FFbFA1B8b9C85400f1726e1bc0892e63D9F"
  ],
  avax: [
    "0x0271A46c049293448C2d4794bCD51f953Bf742e8",
    "0x3A3dAdbca3ec5a815431f45eca33EF1520388Ef2",
  ],
  polygon: ["0x0271A46c049293448C2d4794bCD51f953Bf742e8"],
  base: [
    "0x367F44Fbd5a9c2fDBF18D98F0DAbF15e22da7194",
    "0x3936bC108A503c301e4A7D9A8937ae5ab1B10Fd6"
  ],
};



Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: sumERC4626VaultsExport({ vaults: config[chain], isOG4626: true, })
  }
});

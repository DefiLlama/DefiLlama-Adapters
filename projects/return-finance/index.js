const { sumERC4626VaultsExport } = require("../helper/erc4626")

module.exports = {
  doublecounted: true,
};

const config = {
  ethereum: [
    "0xD8785CDae9Ec24b8796c45E3a2D0F7b03194F826",
    "0xe5c26497D9492AD2328DFEE7dcA240e55cff1779",
    "0xc2d4d9070236bA4ffefd7cf565eb98d11bFeB8E1",
    "0x2C2f0FFbFA1B8b9C85400f1726e1bc0892e63D9F",
  ],
  avax: [
    "0x0271A46c049293448C2d4794bCD51f953Bf742e8",
    "0x3A3dAdbca3ec5a815431f45eca33EF1520388Ef2",
  ],
  polygon: ["0x0271A46c049293448C2d4794bCD51f953Bf742e8"],
  base: ["0xd99d6D4EA1CDa97cC8eaE2A21007C47D3ae54d5F"],
};



Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: sumERC4626VaultsExport({ vaults: config[chain], isOG4626: true, })
  }
});

const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by CIAN Protocol.',
  blockchains: {
    ethereum: {
      turtleclub_erc4626: [
        '0x0d1862e73a1430A5FD3245B47859c1BEcD6f3A1D',
        '0x2B11527e1fab84a5382D20efD198BF3d332f7E73',
        '0x65939777a9dC5A370707bb6b44b1ad0BC9e2D8a4',
        '0x34d16e4fB8757A88D986f9EfE2484F0badBF22C1',
        '0x0982eB22086183bF10acd2991A2dBeD1e3B9Ac2A',
        '0x76f31800eFdE39A5f98189447c7a514d974f4364',
        '0xd72c3a44b51C8D6631C004ecf3A318b9D2c58F80',
        '0x6945f516413cB2d7311297e8A39E7D004dEB5566',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)

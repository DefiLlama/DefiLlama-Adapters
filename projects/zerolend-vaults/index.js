const { getCuratorTvl } = require("../helper/curators");

const multisigs = [
  '0x54061E18cd88D2de9af3D3D7FDF05472253B29E0',
  '0x4E88E72bd81C7EA394cB410296d99987c3A242fE',
  '0x1f906603A027E686b43Fab7f395C11228EbE8ff4',
]

const lineaVaultOwners = [
  '0x0F6e98A756A40dD050dC78959f45559F98d3289d'
]

const configs = {
  methodology: 'Count all assets deposited into vaults curated by ZeroLend',
  ethereum: {
    eulerVaultOwners: multisigs,
    euler: [
      '0xc42d337861878baa4dc820d9e6b6c667c2b57e8a',
      '0x1ab9e92cfde84f38868753d30ffc43f812b803c5',
      '0xc364fd9637fe562a2d5a1cbc7d1ab7f32be900ef'
    ],
  },
  linea: {
    eulerVaultOwners: lineaVaultOwners,
    euler: [],
  },
  berachain: {
    eulerVaultOwners: multisigs,
    euler: [
      '0x28C96C7028451454729750171BD3Bb95D7261B5a',
      '0x112B77A77753b092306b1c04Bd70215FeD4e00a1',
      '0x1B33D24C4C78a61DA80Cfa2d0dB72ca0851d5fb1',
      '0x2247B618251b8d913F3fD10B749e7bfa3E3a28db',
      '0x401c4633dCa173bf75ac85F2D270d98c063F54CF',
      '0x2Bf927248f86Bd78ce300d00C7c8A175e3e0B38a',
    ],
  },
  sonic: {
    eulerVaultOwners: multisigs,
    euler: [
      '0x8c7a2c0729afb927da27d4c9aa172bc5a5fb12bb',
      '0x9ccf74e64922d8a48b87aa4200b7c27b2b1d860a',
    ],
  }
}

const tvl = (chain) => ({ tvl: async (api) => await getCuratorTvl(api, configs[chain]) })

module.exports = {
  doublecounted: true,
  methodology: configs.methodology,
  ethereum: tvl('ethereum'),
  linea: tvl('linea'),
  sonic: tvl('sonic'),
  berachain: tvl('berachain')
}

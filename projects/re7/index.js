const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by Re7 Labs.',
  blockchains: {
    ethereum: {
      morphoVaultOwners: [
        '0x46BA7bCD764a692208781B0Fdc642E272ee597bC',
        '0xE86399fE6d7007FdEcb08A2ee1434Ee677a04433',
      ],
      eulerVaultOwners: [
        '0xa563FEEA4028FADa193f1c1F454d446eEaa6cfD7',
        '0x46BA7bCD764a692208781B0Fdc642E272ee597bC',
      ],
      mellow: [
        '0x84631c0d0081FDe56DeB72F6DE77abBbF6A9f93a',
        '0x62F0BAf53959AF18Cab47082f5aB58A5B93e041C',
        '0x8b0e80716c4be087C271E964E0bDc7780d32A2E8',
        '0x2759E4741b370506BE2ccEf898960108e98f2faf',
        '0x4C690C311d8A5aa16eC2a595D4ea3928a73C48d6',
        '0x617895460004821C8DE800d4a644593cAb0aD40c',
        '0x3a828C183b3F382d030136C824844Ea30145b4c7',
        '0x7F43fDe12A40dE708d908Fb3b9BFB8540d9Ce444',
        '0xc65433845ecD16688eda196497FA9130d6C47Bd8',
        '0x7a4EffD87C2f3C55CA251080b1343b605f327E3a',
        '0x82f5104b23FF2FA54C2345F821dAc9369e9E0B26',
      ],
      turtleclub: [
        '0x294eecec65A0142e84AEdfD8eB2FBEA8c9a9fbad',
      ],
      symbiotic: [
        '0x35E44d92E8F738A272Bddbae53d1Dc9490e75Fe7',
      ],
    },
    base: {
      morphoVaultOwners: [
        '0xD8B0F4e54a8dac04E0A57392f5A630cEdb99C940',
      ],
    },
    sonic: {
      eulerVaultOwners: [
        '0xF602d3816bC63fC5f5Dc87bB56c537D0d0078532',
        '0x46BA7bCD764a692208781B0Fdc642E272ee597bC',
      ],
      siloVaultOwners: [
        '0x3BA1566ED39F865bAf4c1Eb9acE53F3D2062bE65',
      ],
    },
    bob: {
      eulerVaultOwners: [
        '0x46BA7bCD764a692208781B0Fdc642E272ee597bC',
      ],
    },
    berachain: {
      eulerVaultOwners: [
        '0x46BA7bCD764a692208781B0Fdc642E272ee597bC',
      ],
    },
    avax: {
      eulerVaultOwners: [
        '0x7B41b9891887820A75A51a1025dB1A54f4798521',
        '0x3BA1566ED39F865bAf4c1Eb9acE53F3D2062bE65',
      ],
    },
    bsc: {
      eulerVaultOwners: [
        '0x187620a61f4f00Cb629b38e1b38BEe8Ea60d2B8D',
      ],
    },
    wc: {
      morphoVaultOwners: [
        '0x46BA7bCD764a692208781B0Fdc642E272ee597bC',
        '0x598A41fA4826e673829D4c5AfD982C0a43977ca6',
      ],
    },
    polygon:{
      morphoVaultOwners: [
        '0x7B41b9891887820A75A51a1025dB1A54f4798521',
      ],
    },
    unichain:{
      morphoVaultOwners: [
        '0x187620a61f4f00Cb629b38e1b38BEe8Ea60d2B8D',
      ],
    },
    plume_mainnet:{
      morphoVaultOwners: [
        '0x7B41b9891887820A75A51a1025dB1A54f4798521',
        '0x06590Fef209Ebc1f8eEF83dA05984cD4eFf0d0E3',
      ],
    },
    starknet: {
      vesu: [
        '0x7f135b4df21183991e9ff88380c2686dd8634fd4b09bb2b5b14415ac006fe1d',
        '0x52fb52363939c3aa848f8f4ac28f0a51379f8d1b971d8444de25fbd77d8f161',
        '0x2e06b705191dbe90a3fbaad18bb005587548048b725116bff3104ca501673c1',
        '0x6febb313566c48e30614ddab092856a9ab35b80f359868ca69b2649ca5d148d',
        '0x59ae5a41c9ae05eae8d136ad3d7dc48e5a0947c10942b00091aeb7f42efabb7',
        '0x3de03fafe6120a3d21dc77e101de62e165b2cdfe84d12540853bd962b970f99',
      ]
    },
    tac:{
      eulerVaultOwners: [
        '0xE5EAE3770750dC9E9eA5FB1B1d81A0f9C6c3369c',
      ],
    },
    linea:{
      eulerVaultOwners: [
        '0xE5EAE3770750dC9E9eA5FB1B1d81A0f9C6c3369c',
      ],
    },
    plasma: {
      eulerVaultOwners: [
        '0xE5EAE3770750dC9E9eA5FB1B1d81A0f9C6c3369c',
      ],
    },
  }
}

module.exports = {
  ...getCuratorExport(configs),

  // starknet doesn't support historical queries
  timetravel: false,
  hallmarks: [
    ['2025-06-01', "Start tracking vaults on starknet"],
  ]
}

const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are depoisted in all vaults curated by Re7 Labs.',
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
  }
}

module.exports = getCuratorExport(configs)

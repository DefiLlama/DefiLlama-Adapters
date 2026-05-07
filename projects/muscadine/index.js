const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Counts all assets deposited in Muscadine Morpho vaults on Base.',
  blockchains: {
    base: {
      morpho: [
        // V1 Vaults
        '0xf7e26Fa48A568b8b0038e104DfD8ABdf0f99074F', // Muscadine USDC Vault
        '0xAeCc8113a7bD0CFAF7000EA7A31afFD4691ff3E9', // Muscadine cbBTC Vault
        '0x21e0d366272798da3A977FEBA699FCB91959d120', // Muscadine WETH Vault
        // V2 Vaults (Prime)
        '0x89712980cb434ef5ae4ab29349419eb976b0b496', // Muscadine USDC Prime
        '0xd6dcad2f7da91fbb27bda471540d9770c97a5a43', // Muscadine WETH Prime
        '0x99dcd0d75822ba398f13b2a8852b07c7e137ec70', // Muscadine cbBTC Prime
      ],
    },
  }
}

module.exports = getCuratorExport(configs)


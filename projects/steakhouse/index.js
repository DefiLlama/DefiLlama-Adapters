const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are depoisted in all vaults curated by Steakhouse Financial.',
  blockchains: {
    ethereum: {
      morphoVaultOwners: [
        '0x0000aeB716a0DF7A9A1AAd119b772644Bc089dA8',
        '0x255c7705e8BB334DfCae438197f7C4297988085a',
        '0x0A0e559bc3b0950a7e448F0d4894db195b9cf8DD',
        '0xc01Ba42d4Bd241892B813FA8bD4589EAA4C60672',
      ],
    },
    base: {
      morphoVaultOwners: [
        '0x0A0e559bc3b0950a7e448F0d4894db195b9cf8DD',
        '0x0000aeB716a0DF7A9A1AAd119b772644Bc089dA8',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)

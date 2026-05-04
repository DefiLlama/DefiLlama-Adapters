const { getCuratorExport } = require("../helper/curators");

const configs = {
  blockchains: {
    sei: {
      morpho: [
        '0x015F10a56e97e02437D294815D8e079e1903E41C',
        '0x8E181221D5602D4Cf2b87f3A817C0Dac680A7223',
        '0x94E6A8714f36cd7220560638882Fc137AB5eb79c',
        '0x948FcC6b7f68f4830Cd69dB1481a9e1A142A4923',
        '0xbD183661d2E8ceFA31799fE3A4cc6f2127963dc5',
        '0x50715ae180FF0EA799dc8AB635C2D876e528bfe8',
      ],
    },
    celo: {
      morphoVaultOwners: [
        '0x81c76F62f7E05DEC75800150bA5A23f62e2f091F',
      ],
    },
  }
}


module.exports = getCuratorExport(configs)

module.exports.methodology = 'Counts all assets that are deposited in all vaults curated by Feather.'
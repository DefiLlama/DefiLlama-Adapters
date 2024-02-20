const { gmxExports } = require('../helper/gmx')

module.exports = {
  arbitrum: {
    tvl: gmxExports({ vault: "0x355a5a46b27d849d75f65e7766dc1f00faa0be88", })
  },
};
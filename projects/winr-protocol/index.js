const { gmxExports } = require('../helper/gmx')
const WINR_VAULT_CONTRACT = "0x8c50528F4624551Aad1e7A265d6242C3b06c9Fca";

module.exports = {
  arbitrum: {
    tvl: gmxExports({ vault: WINR_VAULT_CONTRACT }),
  },
};
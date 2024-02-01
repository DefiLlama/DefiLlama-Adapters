const { gmxExports } = require('../helper/gmx')

const Vault = '0x853a8cE6B6338f5B0A14BCfc97F9D68396099C9C';

module.exports = {
  base: {
    tvl: gmxExports({ vault: Vault, blacklistedTokens: ['0x5e06ea564efcb3158a85dbf0b9e017cb003ff56f'] })
  },
};

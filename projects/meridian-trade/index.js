const { gmxExports } = require('../helper/gmx')

const base_vault = '0x853a8cE6B6338f5B0A14BCfc97F9D68396099C9C';
const meter_vault = '0x95cd3F1DE20A29B473FcC1773069316a424c746D';

module.exports = {
  base: {
    tvl: gmxExports({ vault: base_vault, blacklistedTokens: ['0x5e06ea564efcb3158a85dbf0b9e017cb003ff56f'] }),
  },
  meter: {
    tvl: gmxExports({ vault: meter_vault })
  }
};

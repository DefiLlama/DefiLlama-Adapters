const { sumTokensExport } = require('../helper/unwrapLPs')
module.exports = {
  arbitrum: { tvl: () => ({}), staking: sumTokensExport({ owners: ['0x36e2b147db67e76ab67a4d07c293670ebefcae4e', '0xb31a0d39d2c69ed4b28d96e12cbf52c5f9ac9a51'], tokens: ['0x1337420dED5ADb9980CFc35f8f2B054ea86f8aB1'] }) },
  start: '2024-03-26',
}
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  methodology: "Counts the RBT tokens staked in the bond contract.",
  megaeth: {
    tvl: () => ({}),
    staking: sumTokensExport({ owner: '0x40f5F3654Db5F7F56cCe33caF0F7a0CAaaE57EAc', token: '0x8F77A685bDe702E6d32A103e9AeB41906317D7e5' }),
  },
}
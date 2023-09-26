
const { gmxExports } = require('../helper/gmx')
const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  era:{
    tvl: sdk.util.sumChainTvls([
      gmxExports({ vault: '0xefdE2AeFE307A7362C7E0E3BE019D1491Dc7E163' }),
      sumTokensExport({ owner: '0x4992eb45172868f0d8cceb91190e159bdf571461', tokens: [ADDRESSES.era.USDC]})
    ])
  },
};

const ADDRESSES = require("../helper/coreAssets.json")
const { sumTokensExport } = require('../helper/unwrapLPs')

const config = {
  polygon: { owners: ["0x94F2EbE929FE948f960908ec57e5D7792fAcAc07"], tokens: [ADDRESSES.polygon.USDC, ADDRESSES.polygon.DAI, ADDRESSES.polygon.USDT] },
  avax: { owners: ["0xa005091c98e6793b90E1340Bbd36C5d6De36fB60"], tokens: [ADDRESSES.avax.USDC, ADDRESSES.avax.USDt] },
  bsc: { owners: ["0x1Ee09A2cAa0813A5183f90F5a6d0E4871f4C6002"], tokens: [ADDRESSES.bsc.DAI] },
  arbitrum: { owners: ["0xed5d1e1320720cae8bb40275550a7d307a082ac3"], tokens: [ADDRESSES.arbitrum.USDC_CIRCLE, ADDRESSES.arbitrum.USDT, ADDRESSES.arbitrum.ARB], },
  optimism: { owners: ["0xeE7981C4642dE8d19AeD11dA3bac59277DfD59D7"], tokens: [ADDRESSES.optimism.USDC, ADDRESSES.optimism.USDT, ADDRESSES.optimism.OP], },
  era: { owners: ["0x46d6E42fB6e04695156b5Ad38a3eC6FA9c59147D"], tokens: [ADDRESSES.era.USDC], },
  linea: { owners: ["0x3E98568770Af932353a2a8C3E3b77cDB7f0c2FA1"], tokens: [ADDRESSES.linea.USDC, ADDRESSES.linea.USDT], },
  base: { owners: ["0x161f4baab4052f20f5f4347ec4422556aa0477f0"], },
  op_bnb: { owners: ["0x3c3f4b866f8c6f0d2c912fee36d5ad337a9aa98e"], },
}

Object.keys(config).forEach(chain => {
  const { owners, tokens = [] } = config[chain]
  tokens.push(ADDRESSES.null)
  module.exports[chain] = { tvl: sumTokensExport({ tokens, owners, }) }
})
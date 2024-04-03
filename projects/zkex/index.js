const ADDRESSES = require("../helper/coreAssets.json")
const { sumTokensExport } = require('../helper/unwrapLPs')

const config = {
  polygon: { owners: ["0x3C7c0ebFCD5786ef48df5ed127cdDEb806db976c"], tokens: [ADDRESSES.polygon.USDC, ADDRESSES.polygon.DAI, ADDRESSES.polygon.USDT, ADDRESSES.polygon.WMATIC_1] },
  avax: { owners: ["0xfB0Ad0B3C2605A7CA33d6badd0C685E11b8F5585"], tokens: [ADDRESSES.avax.USDC, ADDRESSES.avax.USDt] },
  bsc: { owners: ["0x7bd79DEd935B542fb22c74305a4d2A293C18483a"], tokens: ['0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3'] },
  arbitrum: { owners: ["0xe469c1330ceecc375fe17e7d649ea270186d344f"], tokens: [ADDRESSES.arbitrum.USDC_CIRCLE, ADDRESSES.arbitrum.USDT, ADDRESSES.arbitrum.ARB], },
  optimism: { owners: ["0xa194fb4eab262ec9886a119609bbb2800bdd3a2e"], tokens: [ADDRESSES.optimism.USDC, ADDRESSES.optimism.USDT, ADDRESSES.optimism.OP], },
  era: { owners: ["0x3E3C7c1DCbAf343d14da4F0A0CD7E3c4b9765A4c"], tokens: [ADDRESSES.era.USDC], },
  linea: { owners: ["0x2Fad6cB2A9Db68395Ba4f87ff05768485C7fa6Fd"], tokens: [ADDRESSES.linea.USDC, ADDRESSES.linea.USDT], },
  base: { owners: ["0xaa46d98049cd895e980b60abc4af18cae681865a"], },
  op_bnb: { owners: ["0x85079cb83b6cadba34e64bc0f24493f49d8b1f4e"], },
}

Object.keys(config).forEach(chain => {
  const { owners, tokens = [] } = config[chain]
  tokens.push(ADDRESSES.null)
  module.exports[chain] = { tvl: sumTokensExport({ tokens, owners, }) }
})
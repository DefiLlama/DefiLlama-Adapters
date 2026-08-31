const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

// CINE ONE PASS NFT contract treasury on BSC (mint USDT/USDC payments settle here)
const BSC_TREASURY = '0x24a2d2503ed27418d7e5b21b617d4bc03aec55e1'

// Morph Payments merchant receiving wallet (Morph checkout settlements)
const MORPH_TREASURY = '0xeb2afb2af45f3be8d8b1cc5b9bce603be9721760'

const morphTokens = [
  ADDRESSES.morph.USDT0,
  ADDRESSES.morph.USDT,
  ADDRESSES.morph.USDC,
  ADDRESSES.morph.USDC_1,
].filter(Boolean)

const bscTokens = [
  ADDRESSES.bsc.USDT,
  ADDRESSES.bsc.USDC,
].filter(Boolean)

module.exports = {
  methodology:
    'Counts USDT and USDC held in PopcornCine treasury wallets: BSC mint payments settle to the CINE ONE PASS contract treasury (0x24a2d2503ed27418d7e5b21b617d4bc03aec55e1); Morph Payments checkout settlements settle to the merchant receiving wallet (0xeb2afb2af45f3be8d8b1cc5b9bce603be9721760). Atlas Oracle feeds and the PASS NFT are excluded.',
  morph: {
    tvl: sumTokensExport({
      owners: [MORPH_TREASURY],
      tokens: morphTokens,
    }),
  },
  bsc: {
    tvl: sumTokensExport({
      owners: [BSC_TREASURY],
      tokens: bscTokens,
    }),
  },
}

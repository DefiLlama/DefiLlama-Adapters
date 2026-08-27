const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

// Morph Payments merchant receiving / settlement wallet for PopcornCine
const TREASURY = '0xeb2afb2af45f3be8d8b1cc5b9bce603be9721760'

const morphTokens = [
  ADDRESSES.morph.USDT0, // Morph checkout USDT used by PopcornCine Morph config
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
    'Counts USDT and USDC held in the PopcornCine Morph settlement treasury used for CINE ONE PASS mints and prediction/battle payments on Morph L2 (and BNB Chain if present). Atlas Oracle feeds are excluded because they do not custody user deposits. The CINE ONE PASS NFT is a utility access credential and is not counted as TVL.',
  morph: {
    tvl: sumTokensExport({
      owners: [TREASURY],
      tokens: morphTokens,
    }),
  },
  bsc: {
    tvl: sumTokensExport({
      owners: [TREASURY],
      tokens: bscTokens,
    }),
  },
}

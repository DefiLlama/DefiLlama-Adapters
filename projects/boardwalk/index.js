const { getUniTVL } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')

// Legacy BMX staking (Morphex/GMX-style), Base only.
// Migrated here from the 'bmx' entry in registries/gmx.js.
const stakedBmxTracker = '0x3085F25Cbb5F34531229077BAAC20B9ef2AE85CB'
const BMX = '0x548f93779fBC992010C07467cBaf329DD5F059B7'

// Boardwalk DEX (UniswapV2 fork) factory per chain
const config = {
  base:     { factory: '0x5ab5575262c823CcB6F43aEd44e071eDb6Ef9e3c' },
  ethereum: { factory: '0x8b59270dc8cF89EBF00F0e8558409e5B6321F13a' },
  ink:      { factory: '0x8e28edBFb74F5ef7De12E5091CACDcE45EE0BEaC' },
  katana:   { factory: '0x177dbEDd02cEe010b80a0A3F284c9FD9F67D8a9e' },
  fraxtal:  { factory: '0x31e5Ff91e8471346dDEb41cb3E974950F1c256d4' },
}

module.exports = {
  misrepresentedTokens: true,
  start: '2026-05-29',
  methodology: 'Counts the liquidity in all Boardwalk DEX pairs, plus BMX staked on Base.',
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: getUniTVL({ factory: config[chain].factory, useDefaultCoreAssets: true }),
  }
})

// Base-only BMX staking (migrated from registries/gmx.js)
module.exports.base.staking = staking(stakedBmxTracker, BMX)

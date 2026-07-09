const { sumTokens2 } = require('../helper/unwrapLPs')

// NOXA Fun launchpad: LP is single-sided Uniswap V3 liquidity locked forever in the Launch Locker.
// TVL = value of the whitelisted (pair-token) side of the univ3 NFT positions held by the locker,
// doubled to account for the position being spread across a price range (same heuristic as unicrypt-v3).
const config = {
  megaeth: {
    locker: '0x93e7973AF4A920eb2D3c289A6c5001FA80114733',
    nftManager: '0xcb6EaA4AF1c181016824BC76875F7B2E8e0e9C6A',
    whitelistedTokens: ['0x4200000000000000000000000000000000000006'], // WETH
  },
  intuition: {
    locker: '0x120Cc3b3559569b08Af048362D20f1a7e9758dAD',
    nftManager: '0x447bbA8E0151aC3De815D7f5d48c312e363b4b74',
    whitelistedTokens: ['0x81cFb09cb44f7184Ad934C09F82000701A4bF672'], // WTRUST
  },
  arc: {
    locker: '0x630957Cf4582baDa8B583B5A9476a7108cFdE0A4',
    nftManager: '0x39654a85a4c05127f5fd6ed22caec077a0fb1377',
    whitelistedTokens: ['0x3600000000000000000000000000000000000000'], // USDC (arc has no wrapped native)
  },
  robinhood: {
    locker: '0x7F03effbd7ceB22A3f80Dd468f67eF27826acD85',
    nftManager: '0x73991a25c818bf1f1128deaab1492d45638de0d3',
    whitelistedTokens: ['0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73'], // WETH
  },
  merlin: {
    locker: '0x7c6a25cF1B45D7558f744ee151Aeeb8d1B8f52c3',
    nftManager: '0xde6003ced14197e751983406bceea8a5647981d3',
    whitelistedTokens: ['0xF6D226f9Dc15d9bB51182815b320D3fBE324e1bA'], // WBTC
  },
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL is the value of the pair-token (wrapped native / stable) side of the Uniswap V3 LP NFT positions locked in the NOXA Fun Launch Locker, doubled to estimate the full range-spread position value.',
}

Object.keys(config).forEach(chain => {
  const { locker, nftManager, whitelistedTokens } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      await sumTokens2({ api, owners: [locker], resolveUniV3: true, uniV3WhitelistedTokens: whitelistedTokens, uniV3ExtraConfig: { nftAddress: nftManager } })
      return api.getBalancesV2().clone(2).getBalances()
    },
  }
})

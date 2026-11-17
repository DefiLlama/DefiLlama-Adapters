const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/sumTokens')

// Trestly's vault, the same address on Ethereum and BNB Chain: the USDT it holds backs kUSDT on Kaspa 1:1.
const VAULT = '0xfa9869982542FB20baD929789B252b7b06EeE10e'

module.exports = {
  methodology: 'TVL is the USDT locked in the Trestly vault on Ethereum and BNB Chain, which backs kUSDT on Kaspa 1:1 (it includes bridge fees not yet withdrawn).',
  ethereum: { tvl: sumTokensExport({ owner: VAULT, tokens: [ADDRESSES.ethereum.USDT] }) },
  bsc: { tvl: sumTokensExport({ owner: VAULT, tokens: [ADDRESSES.bsc.USDT] }) },
}

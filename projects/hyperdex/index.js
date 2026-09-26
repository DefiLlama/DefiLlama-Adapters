// HyperDex routes swaps, bridges, baskets and launches into third-party protocols and holds no user deposits,
// so it has no TVL. Volume and fees are tracked in DefiLlama/dimension-adapters (#9680).
const tvl = async () => ({})

module.exports = {
  methodology: 'HyperDex holds no user funds: swaps and bridges execute through LI.FI, deposits sit in the underlying protocols. TVL is 0.',
}

;['robinhood', 'base', 'arbitrum', 'ethereum', 'arc', 'solana'].forEach(chain => {
  module.exports[chain] = { tvl }
})

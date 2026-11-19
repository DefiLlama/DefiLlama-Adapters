const ADDRESSES = require('../helper/coreAssets.json')

// bskts (bskts.xyz): index baskets on Robinhood Chain. Each basket is a vault that holds
// its constituents (Stock Tokens and crypto) behind its own token, minted and redeemed at
// net asset value. Every basket is created by one factory, which lists them on-chain, and
// each basket reports its own constituents, so new baskets are picked up without an
// adapter change.
const FACTORY = '0xb7c27E044E8Acc8aB3f091a2F9d424A32723e4c3'

// BSKTS, the index of baskets. It holds other baskets' shares, which are already counted
// in those baskets, so only the USDG it may carry between rebalances is counted here.
const INDEX_VAULT = '0xa71aaF7e54bd27140fe6EB25e008DaF31E2fFe3d'

const abi = {
  baskets: 'address[]:baskets',
  constituentTokens: 'address[]:constituentTokens',
  wants: 'function wants() view returns (address token0, address token1)',
}

async function tvl(api) {
  const baskets = await api.call({ target: FACTORY, abi: abi.baskets })
  const constituents = await api.multiCall({ abi: abi.constituentTokens, calls: baskets })

  // Beefy CLM shares held by the yield baskets (WAFER, COMET) are already counted by Beefy
  const tokens = [...new Set(constituents.flat().map((t) => t.toLowerCase()))]
  const wants = await api.multiCall({ abi: abi.wants, calls: tokens, permitFailure: true })
  const clms = new Set(tokens.filter((_, i) => wants[i]))

  const ownerTokens = baskets.map((basket, i) => [
    constituents[i].filter((t) => !clms.has(t.toLowerCase())),
    basket,
  ])
  ownerTokens.push([[ADDRESSES.robinhood.USDG], INDEX_VAULT])
  return api.sumTokens({ ownerTokens })
}

module.exports = {
  methodology:
    'TVL is the tokens held by every bskts basket vault on Robinhood Chain: the Stock Tokens and crypto behind each basket token, read from the vault itself. Baskets are listed on-chain by the bskts factory, and each basket reports its own constituents. The Beefy CLM vault shares held by the yield baskets are excluded, as Beefy already counts them. The BSKTS index holds other baskets\' shares, already counted, so only its USDG is added. Tokens in users\' own wallets and bskts accounts, open orders, and the Weekend Cover market are not counted.',
  start: '2026-08-26', // the factory and the current basket vaults
  robinhood: { tvl },
}

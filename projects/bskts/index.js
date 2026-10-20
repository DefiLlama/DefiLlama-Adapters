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
  balances: 'function balances() view returns (uint256 amount0, uint256 amount1)',
}

async function tvl(api) {
  const baskets = await api.call({ target: FACTORY, abi: abi.baskets })
  const constituents = await api.multiCall({ abi: abi.constituentTokens, calls: baskets })

  // The yield baskets (WAFER, COMET) hold Beefy CLM vault shares rather than the tokens
  // themselves. A CLM share is a claim on its vault's two tokens, so each one held is
  // counted as its share of the vault's balances.
  const tokens = [...new Set(constituents.flat().map((t) => t.toLowerCase()))]
  const wants = await api.multiCall({ abi: abi.wants, calls: tokens, permitFailure: true })
  const clms = new Set(tokens.filter((_, i) => wants[i]))

  const ownerTokens = baskets.map((basket, i) => [
    constituents[i].filter((t) => !clms.has(t.toLowerCase())),
    basket,
  ])
  ownerTokens.push([[ADDRESSES.robinhood.USDG], INDEX_VAULT])
  await api.sumTokens({ ownerTokens })

  const holdings = baskets.flatMap((basket, i) =>
    constituents[i].filter((t) => clms.has(t.toLowerCase())).map((clm) => ({ clm, basket })),
  )
  if (!holdings.length) return
  const held = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: holdings.map(({ clm, basket }) => ({ target: clm, params: [basket] })),
  })
  const vaults = [...new Set(holdings.map(({ clm }) => clm.toLowerCase()))]
  const [vaultWants, vaultBalances, supplies] = await Promise.all([
    api.multiCall({ abi: abi.wants, calls: vaults }),
    api.multiCall({ abi: abi.balances, calls: vaults }),
    api.multiCall({ abi: 'erc20:totalSupply', calls: vaults }),
  ])
  holdings.forEach(({ clm }, i) => {
    const v = vaults.indexOf(clm.toLowerCase())
    if (!+supplies[v]) return
    const share = (amount) => (BigInt(amount) * BigInt(held[i])) / BigInt(supplies[v])
    api.add(vaultWants[v].token0, share(vaultBalances[v].amount0))
    api.add(vaultWants[v].token1, share(vaultBalances[v].amount1))
  })
}

module.exports = {
  methodology:
    'TVL is the tokens held by every bskts basket vault on Robinhood Chain: the Stock Tokens and crypto behind each basket token, read from the vault itself. Baskets are listed on-chain by the bskts factory, and each basket reports its own constituents. The yield baskets hold Beefy CLM vault shares, counted as their share of each CLM vault\'s two tokens. The BSKTS index holds other baskets\' shares, already counted, so only its USDG is added. Tokens in users\' own wallets and bskts accounts, open orders, and the Weekend Cover market are not counted.',
  start: '2026-08-26', // the factory and the current basket vaults
  robinhood: { tvl },
}

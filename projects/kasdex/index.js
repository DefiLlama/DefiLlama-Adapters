// KasDex is a single-contract, multi-pool constant-product AMM: every pool's
// reserves are held as plain ERC20 balances of the KasDex contract itself
// (no factory / per-pair contracts), so TVL = the contract's token balances.
const KASDEX = '0xEA4c25D1e8111e74F7c1d3C92dA840e78D5e67E7'

// token address -> [coingecko id, decimals]; WKAS is 1:1 wrapped bridged KAS
const TOKENS = {
  '0xCfEa894a9a6745719D72C5dE2002AbC1e6626551': ['kaspa', 18], // WKAS
  '0xA5b8BF902b2844dA17d4506cc827F7F1681735E7': ['usd-coin', 6], // USDC
  '0x46346F49b4fe8c640c5FCdbed2d6741056FEB959': ['tether', 6], // USDT
  '0x69790024D44504F05973E127197E6df17e283859': ['weth', 18], // WETH
}

async function tvl(api) {
  const tokens = Object.keys(TOKENS)
  const bals = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: tokens.map((t) => ({ target: t, params: KASDEX })),
  })
  tokens.forEach((t, i) => {
    const [cgId, decimals] = TOKENS[t]
    api.addCGToken(cgId, bals[i] / 10 ** decimals)
  })
}

module.exports = {
  methodology:
    'TVL is the sum of pool reserves (WKAS, USDC, USDT, WETH) held by the KasDex AMM contract on Igra. KasDex is a single-contract multi-pool constant-product DEX, so all reserves live as ERC20 balances of one address.',
  igra: { tvl },
}

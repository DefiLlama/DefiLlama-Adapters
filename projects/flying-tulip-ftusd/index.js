// Flying Tulip ftUSD — yield-bearing stablecoin backed by yield-wrapped collateral.
// Prod addresses from https://api.flyingtulip.com/ftusd/contracts/all.

const MINT_AND_REDEEM = {
  ethereum: '0xaa48ecbc843cf7e9a29155d112b8cb27902bd23c',
  sonic: '0x0c6f8ec81c3ea5bff06f6cd0791780f9f050ee31',
}

async function tvl(api) {
  const target = MINT_AND_REDEEM[api.chain]
  const count = await api.call({ target, abi: 'uint256:collateralCount' })
  const indices = Array.from({ length: Number(count) }, (_, i) => i)
  const tokens = await api.multiCall({
    target,
    abi: 'function collateralAt(uint256) view returns (address)',
    calls: indices,
  })
  const balances = await api.multiCall({
    target,
    abi: 'function collateralAssets(address) view returns (uint256)',
    calls: tokens,
  })
  api.add(tokens, balances)
}

module.exports = {
  methodology:
    'Sum of collateral tokens backing ftUSD, read via MintAndRedeem.collateralAssets() for each enabled collateral. Covers yield-wrapper principal plus accrued strategy yield.',
  ethereum: { tvl },
  sonic: { tvl },
}

const factory = '0xBce601b8e027759e57480703904DD4c6b6A63761'

async function tvl(api) {
  const pairCount = Number(await api.call({ target: factory, abi: 'uint256:allPairsLength' }))
  const pairs = await api.multiCall({
    target: factory,
    abi: 'function allPairs(uint256) view returns (address)',
    calls: Array.from({ length: pairCount }, (_, index) => index),
  })
  if (!pairs.length) return

  // WordPair exposes separate reserve getters, rather than V2 getReserves().
  const [token0s, token1s, reserve0s, reserve1s] = await Promise.all([
    api.multiCall({ abi: 'address:token0', calls: pairs }),
    api.multiCall({ abi: 'address:token1', calls: pairs }),
    api.multiCall({ abi: 'uint256:reserve0', calls: pairs }),
    api.multiCall({ abi: 'uint256:reserve1', calls: pairs }),
  ])
  pairs.forEach((_, index) => {
    api.add(token0s[index], reserve0s[index])
    api.add(token1s[index], reserve1s[index])
  })
}

module.exports = {
  start: 1791138613,
  methodology: 'Counts token reserves in all Word Finance DEX pools discovered on-chain from the BNB factory. Reserves include retained LP fees but exclude pending protocol fees and unsolicited transfers. LP receipt tokens and treasury holdings are not added. Token pricing is provided by DefiLlama; no price is inferred from these pools for unpriced assets.',
  bsc: { tvl },
}

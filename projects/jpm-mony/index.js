const MONY = "0x6a7c6aa2b8b8a6a891de552bdeffa87c3f53bd46"

async function tvl(_, __, ___, { api }) {
  const supply = await api.call({
    target: MONY,
    abi: "erc20:totalSupply",
  })

  const tvl = Number(supply) / 1e4

  api.addUSDValue(tvl)

  return api.getBalances()
}

module.exports = {
  methodology: "Tracks total supply of MONY representing shares in JPMorgan My OnChain Net Yield Fund.",
  start: 1764247931,
  ethereum: {
    tvl,
  }
}
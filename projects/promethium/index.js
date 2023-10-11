const pools = [
  '0x7D7bf8B7FfC364CA7dDA1Bb66C88108F00086551',
  '0x775AFb156D7bCa10bE12DC40E06e9E0EBFEb5E15',
  '0x8648F1cd46B103F091a7a0f2EDD78Af492Aae788',
  '0x0eeD421F88b0818Cba38aF96e33d1f42C988c726',
  '0x32bD19a79DC462b9d18f2Db2593C78aB9ea630BC',
]

const abi = {
  "asset": "address:asset",
  "totalAssets": "uint256:totalAssets"
}

async function tvl(timestamp, block, chainBlocks, { api }) {
  const tokens = await api.multiCall({ abi: abi.asset, calls: pools, permitFailure: true, })
  const bals = await api.multiCall({ abi: abi.totalAssets, calls: pools, permitFailure: true, })
  tokens.forEach((v, i) => {
    if (v && bals[i]) api.add(v, bals[i])
  })
  return api.getBalances()
}

module.exports = {
  methodology:
    "TVL displays the total amount of assets stored in the Promethium contracts, excluding not claimed fees.",
  start: 1696164866,
  arbitrum: { tvl },
  hallmarks: [[1696164866, "Profitable pools deployment"]],
};

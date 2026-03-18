const config = {
  bsc: {
    vault: '0x8F73b65B4caAf64FBA2aF91cC5D4a2A1318E5D8C',
    creditMarketId: '0x523809244d5ec5633a17fee837c16c69a0c6cf3b5596486a6c22b3000ecda5ad',
  },
}

const abi = {
  idToMarketParams:
    'function idToMarketParams(bytes32) view returns (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv)',
  market:
    'function market(bytes32) view returns (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee)',
}

async function borrowed(api) {
  const { vault, creditMarketId } = config[api.chain]
  const marketId = creditMarketId

  const [params, market] = await Promise.all([
    api.call({ target: vault, abi: abi.idToMarketParams, params: [marketId] }),
    api.call({ target: vault, abi: abi.market, params: [marketId] }),
  ])

  api.add(params.loanToken, market.totalBorrowAssets)
  return api.getBalances()
}

module.exports = {
  methodology:
    'Borrowed: totalBorrowAssets for the credit market (unsecured, no collateral). Fixed marketId from Lista Credit.',
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl: () => ({}), borrowed }
})

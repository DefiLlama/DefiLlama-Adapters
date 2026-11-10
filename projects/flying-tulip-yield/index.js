// The put offering's collateral registry is the source of truth for its yield wrappers.
const PUT_MANAGER = '0xbA49d0AC42f4fBA4e24A8677a22218a4dF75ebaA'

async function tvl(api) {
  const tokens = await api.fetchList({
    target: PUT_MANAGER,
    lengthAbi: 'uint256:collateralIndex',
    itemAbi: 'function getCollateral(uint256) view returns (address)',
  })
  const wrappers = await api.multiCall({ target: PUT_MANAGER, abi: 'function vaults(address) view returns (address)', calls: tokens })
  // valueOfCapital includes idle underlying and the current underlying value of each strategy.
  // capital/collateralSupply are principal counters, and omit accrued strategy yield.
  const values = await api.multiCall({ abi: 'uint256:valueOfCapital', calls: wrappers })
  api.add(tokens, values)
  // Include collateral temporarily held by the manager during divestment, once.
  await api.sumTokens({ owner: PUT_MANAGER, tokens })
}

module.exports = {
  methodology: 'Counts collateral backing Flying Tulip put positions: current underlying asset value held by yield wrappers registered in PutManager, including deployed strategy assets and accrued yield, plus idle collateral held by PutManager. Excludes FT tokens, put notional value, and investor multisig assets held outside these wrappers.',
  ethereum: { tvl },
}

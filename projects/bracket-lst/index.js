const brktETH = '0x6C8550167BbD06D4610a6A443eCbEd84Bd1AccD6'

const abis = {
  collaterals: "function collaterals(uint256) external view returns (address collateral, bool whitelisted, uint256 totalDeposit)"
}

const tvl = async (api) => {
  const colls = await api.fetchList({ target: brktETH, itemAbi: abis.collaterals, itemCount: 20, permitFailure: true })
  const tokens = colls.filter(item => item && item.whitelisted).map(item => item && item.collateral)
  await api.sumTokens({ tokens, owner: brktETH })
}

module.exports = {
  doublecounted: true,
  ethereum: { tvl }
}
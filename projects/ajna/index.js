const sdk = require("@defillama/sdk")
const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(_, _b, _cb, { api, }) {
  const pools = await api.call({  abi: 'address[]:getDeployedPoolsList', target: '0xe6f4d9711121e5304b30ac2aae57e3b085ad3c4d'})
  const collaterals = await api.multiCall({  abi: 'address:collateralAddress', calls: pools})
  const borrows = await api.multiCall({  abi: 'address:quoteTokenAddress', calls: pools})
  const ownerTokens = pools.map((v, i) => [[collaterals[i], borrows[i]], v])
  return sumTokens2({ ownerTokens, api})
}

async function borrowed(_, _b, _cb, { api, }) {
    const pools = await api.call({  abi: 'address[]:getDeployedPoolsList', target: '0xe6f4d9711121e5304b30ac2aae57e3b085ad3c4d'})
    const debts = await api.multiCall({  abi: 'function debtInfo() external view returns (uint256, uint256, uint256, uint256)', calls: pools})
    const borrows = await api.multiCall({  abi: 'address:quoteTokenAddress', calls: pools})
    const borrowScale = await api.multiCall({  abi: 'uint:quoteTokenScale', calls: pools})
    const balances = {}
    pools.map((v, i) => sdk.util.sumSingleBalance(balances, borrows[i], debts[i][0]/borrowScale[i]))
    return balances
  }

module.exports = {
  misrepresentedTokens: true,
  ethereum: { tvl, borrowed }
}
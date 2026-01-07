const { getUniqueAddresses } = require('../helper/utils')
const { sumTokens2 } = require('../helper/unwrapLPs')

const BNPL_FACTORY = '0x7edB0c8b428b97eA1Ca44ea9FCdA0835FBD88029'

async function getNodes(api) {
  return api.fetchList({
    lengthAbi: abi.bankingNodeCount,
    itemAbi: abi.bankingNodesList,
    target: BNPL_FACTORY,
  })
}

async function tvl(api) {
  const nodes = await getNodes(api)

  const tokens = getUniqueAddresses([
    '0x3Ed3B47Dd13EC9a98b44e6204A523E766B225811', // aave USDT
    '0xBcca60bB61934080951369a648Fb03DF4F96263C', // aave USDC
  ])

  return sumTokens2({ api, owners: nodes, tokens })
}

async function staking(api) {
  const nodes = await getNodes(api)

  return sumTokens2({
    api,
    owners: nodes,
    tokens: [
      '0x84d821f7fbdd595c4c4a50842913e6b1e07d7a53', // BNPL
    ],
  })
}

// Borrowed TVL should reflect outstanding debt, not deposits.
// Borrowed may legitimately be zero if there are no active outstanding loans.
// This adapter computes borrowed from on-chain loan state and does not infer values.
async function borrowed(api) {
  const nodes = await getNodes(api)
  if (!nodes.length) return api.getBalances()

  const baseTokens = await api.multiCall({ abi: abi.baseToken, calls: nodes })

  const loanIdLists = await Promise.all(nodes.map(async (node) => {
    return api.fetchList({
      lengthAbi: abi.getCurrentLoansCount,
      itemAbi: abi.currentLoans,
      target: node,
    })
  }))

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const baseToken = baseTokens[i]
    const loanIds = loanIdLists[i] || []
    if (!loanIds.length) continue

    const loans = await api.multiCall({
      abi: abi.idToLoan,
      calls: loanIds.map((id) => ({ target: node, params: [id] })),
    })

    for (const loan of loans) {
      if (!loan) continue
      const { principalRemaining, isSlashed } = loan
      if (isSlashed) continue
      if (!principalRemaining) continue
      api.add(baseToken, principalRemaining)
    }
  }

  return api.getBalances()
}

const abi = {
  bankingNodeCount: "uint256:bankingNodeCount",
  bankingNodesList: "function bankingNodesList(uint256) view returns (address)",
  baseToken: "address:baseToken",
  getCurrentLoansCount: "uint256:getCurrentLoansCount",
  currentLoans: "function currentLoans(uint256) view returns (uint256)",
  idToLoan: "function idToLoan(uint256) view returns (address borrower, bool interestOnly, uint256 loanStartTime, uint256 loanAmount, uint256 paymentInterval, uint256 interestRate, uint256 numberOfPayments, uint256 principalRemaining, uint256 paymentsMade, address collateral, uint256 collateralAmount, bool isSlashed)",
}

module.exports = {
  deadFrom: '2023-02-12',
  ethereum: { tvl, staking, borrowed },
}

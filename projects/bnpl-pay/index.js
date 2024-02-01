const sdk = require('@defillama/sdk')
const { getParamCalls, getUniqueAddresses } = require('../helper/utils')
const { sumTokens2 } = require('../helper/unwrapLPs')
const chain = 'ethereum'
const BNPL_FACTORY = '0x7edB0c8b428b97eA1Ca44ea9FCdA0835FBD88029'
let nodes = {}

async function getNodes(block) {
  if (!nodes[block]) nodes[block] = _getNodes(block)
  return nodes[block]
}

async function _getNodes(block) {
  const { output: nodeCount } = await sdk.api.abi.call({
    target: BNPL_FACTORY,
    abi: abi.bankingNodeCount,
    chain, block,
  })

  const nodeCalls = getParamCalls(nodeCount)
  const { output: res } = await sdk.api.abi.multiCall({
    target: BNPL_FACTORY,
    abi: abi.bankingNodesList,
    calls: nodeCalls,
    chain, block,
  })

  const nodes = res.map(i => i.output.toLowerCase())
  const baseTokenCalls = nodes.map(i => ({ target: i }))
  const { output: tokens } = await sdk.api.abi.multiCall({
    abi: abi.baseToken,
    calls: baseTokenCalls,
    chain, block,
  })
  const baseTokenMapping = {}
  tokens.forEach(({ input: { target }, output }) => baseTokenMapping[target] = output)
  return { nodes, baseTokenMapping }
}

async function tvl(_, block) {
  const { nodes, baseTokenMapping, } = await getNodes(block)
  const tokens = getUniqueAddresses([
    // ...Object.keys(baseTokenMapping),
    '0x3Ed3B47Dd13EC9a98b44e6204A523E766B225811', // aave USDT
    '0xBcca60bB61934080951369a648Fb03DF4F96263C', // aave USDC
  ])
  return sumTokens2({ chain, block, owners: nodes, tokens, })
}

async function staking(_, block) {
  const { nodes } = await getNodes(block)
  return sumTokens2({
    chain, block, owners: nodes, tokens: [
      '0x84d821f7fbdd595c4c4a50842913e6b1e07d7a53', // BNPL
    ]
  })
}

async function borrowed(_, block) {
  const { nodes, baseTokenMapping, } = await getNodes(block)
  const balances = {}
  const loanCountCalls = nodes.map(i => ({ target: i }))
  const { output: loanCounts } = await sdk.api.abi.multiCall({
    abi: abi.getCurrentLoansCount,
    calls: loanCountCalls,
    chain, block,
  })
  const loanToIdCalls = []
  loanCounts.forEach(({ input: { target}, output }) => {
    const calls = getParamCalls(output)
    calls.forEach(i => i.target = target)
    loanToIdCalls.push(...calls)
  })

  const { output: loanIds } = await sdk.api.abi.multiCall({
    abi: abi.currentLoans,
    calls: loanToIdCalls,
    chain, block,
  })

  const idToLoanCalls = loanIds.map(({ input: { target }, output }) => ({ target, params: output }))
  const { output: res } = await sdk.api.abi.multiCall({
    abi: abi.idToLoan,
    calls: idToLoanCalls,
    chain, block,
  })

  res.forEach(({ output, input: { target } }) => {
    sdk.util.sumSingleBalance(balances, baseTokenMapping[target], output.principalRemaining)
  })
  return balances
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
  ethereum: { tvl, staking, borrowed, },
}

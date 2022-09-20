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
  bankingNodeCount: {
    "inputs": [],
    "name": "bankingNodeCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  bankingNodesList: {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "bankingNodesList",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  baseToken: {
    "inputs": [],
    "name": "baseToken",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  getCurrentLoansCount: {
    "inputs": [],
    "name": "getCurrentLoansCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  currentLoans: {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "currentLoans",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  idToLoan: {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "idToLoan",
    "outputs": [
      {
        "internalType": "address",
        "name": "borrower",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "interestOnly",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "loanStartTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "loanAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "paymentInterval",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "interestRate",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "numberOfPayments",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "principalRemaining",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "paymentsMade",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "collateral",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "collateralAmount",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isSlashed",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
}

module.exports = {
  ethereum: { tvl, staking, borrowed, },
}

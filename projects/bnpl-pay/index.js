const { getUniqueAddresses } = require('../helper/utils')
const { sumTokens2 } = require('../helper/unwrapLPs')
const BNPL_FACTORY = '0x7edB0c8b428b97eA1Ca44ea9FCdA0835FBD88029'


async function tvl(api) {
  const nodes = await api.fetchList({ lengthAbi: abi.bankingNodeCount, itemAbi: abi.bankingNodesList, target: BNPL_FACTORY })

  const tokens = getUniqueAddresses([
    '0x3Ed3B47Dd13EC9a98b44e6204A523E766B225811', // aave USDT
    '0xBcca60bB61934080951369a648Fb03DF4F96263C', // aave USDC
  ])
  return sumTokens2({ api, owners: nodes, tokens, })
}

async function staking(api) {
  const nodes = await api.fetchList({ lengthAbi: abi.bankingNodeCount, itemAbi: abi.bankingNodesList, target: BNPL_FACTORY })

  return sumTokens2({
    api, owners: nodes, tokens: [
      '0x84d821f7fbdd595c4c4a50842913e6b1e07d7a53', // BNPL
    ]
  })
}

async function borrowed(api) {
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
  ethereum: { tvl, staking, borrowed, },
}

module.exports.ethereum.borrowed = () => ({}) // bad debt

const { getUniqueAddresses } = require('../helper/utils')
const { sumTokens2 } = require('../helper/unwrapLPs')

const BNPL_FACTORY = '0xa800488decf9d4454a2d1ca1968468d0d5772f00' // New proxy (deployed Sept 2025)

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
      '0x28a062b8cd62a219210211f2085281c0aca2b2b9', // BNPL (new token)
    ],
  })
}

// Note: Borrowed TVL tracking temporarily disabled due to protocol contract upgrade.
// New banking node contracts (v2) use different interface - baseToken(), getCurrentLoansCount(),
// currentLoans(), and idToLoan() functions no longer exist in new implementation.
// Waiting for protocol team to provide updated contract interface documentation.

const abi = {
  bankingNodeCount: "uint256:bankingNodeCount",
  bankingNodesList: "function bankingNodesList(uint256) view returns (address)",
}

module.exports = {
  ethereum: { tvl, staking },
}

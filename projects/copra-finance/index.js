const { getLogs, } = require("../helper/cache/getLogs");

async function tvl(api) {
  const { factory, fromBlock } = config[api.chain];

  const logs = await getLogs({
    api,
    target: factory,
    onlyArgs: true,
    eventAbi: 'event CreditAccountDeployed (address indexed creditAccount)',
    fromBlock,
  })
  const creditAccounts = logs.map((i) => i.creditAccount)
  const status = await api.multiCall({ abi: 'function getStatus() view returns (uint8)', calls: creditAccounts })
  const activeCreditAccounts = creditAccounts.filter((_, i) => status[i] == 0 || status[i] == 1)
  const tokens = (await api.multiCall({ abi: 'function getTerms() view returns (uint256 tenor, uint256 principalAmount, uint256 interestAmount, uint256 securityDepositAmount, address token)', calls: activeCreditAccounts })).map(i => i.token)
  const lenderAmounts = await api.multiCall({ abi: 'uint256:getTotalFundedPrincipalAmount', calls: activeCreditAccounts })
  const borrowerAmounts = await api.multiCall({ abi: 'uint256:getBorrowerFundedAmount', calls: activeCreditAccounts })
  api.add(tokens, lenderAmounts)
  api.add(tokens, borrowerAmounts)
}

const config = {
  arbitrum: {
    factory: "0x2eaA3A5223FCb7A9EeC3bFCD399A4c479c6008f6",
    fromBlock: 183991616,
  },
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl }
})

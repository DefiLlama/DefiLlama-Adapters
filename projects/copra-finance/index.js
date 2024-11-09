const { getLogs, } = require("../helper/cache/getLogs");

async function tvl(api) {
  const { factory, fromBlock } = config[api.chain];

  // V1
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
  const v1Tokens = (await api.multiCall({ abi: 'function getTerms() view returns (uint256 tenor, uint256 principalAmount, uint256 interestAmount, uint256 securityDepositAmount, address token)', calls: activeCreditAccounts })).map(i => i.token)
  const lenderAmounts = await api.multiCall({ abi: 'uint256:getTotalFundedPrincipalAmount', calls: activeCreditAccounts })
  const borrowerAmounts = await api.multiCall({ abi: 'uint256:getBorrowerFundedAmount', calls: activeCreditAccounts })
  api.add(v1Tokens, lenderAmounts)
  api.add(v1Tokens, borrowerAmounts)

  // V2
  const copraRegistryAddr = "0x10D3362BBf04427126c807d28665fA4Da5fBDF14"
  const [v2LiquidityWarehouses] = await api.multiCall({ abi: 'address[]:getLiquidityWarehouses', calls: [copraRegistryAddr]})
  const v2Tokens = (await api.multiCall({ abi: 'function getTerms() view returns (address asset, address feeRecipient, uint64 liquidationThreshold, uint64 capacityThreshold, uint64 interestRate, uint64 interestFee, uint64 withdrawalFee)', calls: v2LiquidityWarehouses })).map(i => i.asset)
  const v2NetAssetValues = await api.multiCall({ abi: "uint256:getNetAssetValue", calls: v2LiquidityWarehouses})
  api.add(v2Tokens, v2NetAssetValues)
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

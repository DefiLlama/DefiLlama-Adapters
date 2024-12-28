const { sumTokens2 } = require('../helper/unwrapLPs')

const getNumberOfOptionsContractsAbi = "uint256:getNumberOfOptionsContracts";
const optionsContractsAbi = "function optionsContracts(uint256) view returns (address)";
const collateralAbi = "address:collateral"

const factoriesAddresses = [
  "0xb529964F86fbf99a6aA67f72a27e59fA3fa4FEaC",
  "0xcC5d905b9c2c8C9329Eb4e25dc086369D6C7777C"
]

async function tvl(api) {
  let contracts = await Promise.all(
    factoriesAddresses.map(i => api.fetchList({
      target: i,
      lengthAbi: getNumberOfOptionsContractsAbi,
      itemAbi: optionsContractsAbi,
    }))
  )

  contracts = contracts.flat()
  const collaterals = await api.multiCall({
    abi: collateralAbi,
    calls: contracts,
  })

  const tokensAndOwners = collaterals.map((t, i) => ([t, contracts[i]]))
  return sumTokens2({ api, tokensAndOwners})
}

module.exports = {
  ethereum: {
    tvl
  },
};
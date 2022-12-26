const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { createIncrementArray } = require('../helper/utils')


const chain = "ethereum"

const addressProviders = [
  '0x139c15e21b0f6e43fc397face5de5b7d5ae6874a',
  '0xa298d39715AE492e4CAF3Ccb33cBF57abC5238d7',
]

async function tvl(timestamp, block) {
  const balances = {}
  const { output: vaultCounts } = await sdk.api.abi.multiCall({
    calls: addressProviders.map(i => ({ target: i })),
    abi: abi.poolsCount,
    chain, block,
  })
  const vaultCallsList = []
  vaultCounts.forEach((j, idx) => {
    createIncrementArray(j.output).forEach(i => vaultCallsList.push({ params: i, target: addressProviders[idx] }))
  })
  
  const { output: vaultsOut } = await sdk.api.abi.multiCall({
    abi: abi.getPoolAtIndex,
    calls: vaultCallsList,
    chain, block,
  })

  const strategies = vaultsOut.map(i => i.output)

  const { output: tokens } = await sdk.api.abi.multiCall({
    abi: abi.getUnderlying,
    calls: strategies.map(i => ({ target: i })),
    chain, block,
  })

  const { output: deposits } = await sdk.api.abi.multiCall({
    abi: abi.totalUnderlying,
    calls: strategies.map(i => ({ target: i })),
    chain, block,
  })

  tokens.forEach((data, i) => {
    sdk.util.sumSingleBalance(balances, data.output, deposits[i].output)
  })

  return balances
}

module.exports = {
  methodology: 'Counts the DAI and USDC that has been deposited into the protocol',
  ethereum: {
    tvl
  }
};
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { createIncrementArray } = require('../helper/utils')


const chain = "ethereum"

const addressProvider = '0x139c15e21b0f6e43fc397face5de5b7d5ae6874a'

async function tvl(timestamp, block) {
  const balances = {}
  const { output: vaultCount } = await sdk.api.abi.call({
    target: addressProvider,
    abi: abi.vaultsCount,
    chain, block,
  })
  const vaultCalls = createIncrementArray(vaultCount).map(i => ({ params: i }))
  const { output: vaultsOut } = await sdk.api.abi.multiCall({
    target: addressProvider,
    abi: abi.getVaultAtIndex,
    calls: vaultCalls,
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
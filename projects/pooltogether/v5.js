const { default: BigNumber } = require('bignumber.js')
const sdk = require('@defillama/sdk')
const abi = require('./abi.json')

const V5_VAULT_FACTORIES = {
  optimism: '0xF65FA202907D6046D1eF33C521889B54BdE08081'
}

async function getChainBalances(chain, block) {
  const balances = {}

  // Finding total number of vaults deployed through the factory:
  const { output: totalVaults } = await sdk.api.abi.call({
    target: V5_VAULT_FACTORIES[chain],
    abi: abi.totalVaults,
    block,
    chain
  })

  // Finding all vault addresses:
  const vaultIndexes = Array.from({ length: totalVaults }, (_, i) => i)
  const { output: vaultAddressesMulticallResult } = await sdk.api.abi.multiCall({
    target: V5_VAULT_FACTORIES[chain],
    abi: abi.allVaults,
    block,
    chain,
    calls: vaultIndexes.map((i) => ({
      params: [i]
    }))
  })
  const vaultAddresses = vaultAddressesMulticallResult.map((result) => result.output)

  // Finding all underlying asset addresses and balances:
  const vaultCalls = vaultAddresses.map((address) => ({ target: address }))
  const { output: assetAddressesMulticallResult } = await sdk.api.abi.multiCall({
    abi: abi.asset,
    block,
    chain,
    calls: vaultCalls
  })
  const { output: assetBalancesMulticallResult } = await sdk.api.abi.multiCall({
    abi: abi.totalAssets,
    block,
    chain,
    calls: vaultCalls
  })
  const assetAddresses = assetAddressesMulticallResult.map((result) => result.output)
  const assetBalances = assetBalancesMulticallResult.map((result) => result.output)

  // Assigning balances:
  assetAddresses.forEach((address, i) => {
    const token = `${chain}:${address}`
    const balance = assetBalances[i]
    if (balances[token] === undefined) {
      balances[token] = balance
    } else {
      const newBalance = BigNumber.sum(BigNumber(balances[token]), BigNumber(balance))
      balances[token] = newBalance.toString()
    }
  })

  return balances
}

async function optimism(timestamp, block, chainBlocks) {
  return getChainBalances('optimism', chainBlocks.optimism)
}

module.exports = {
  optimism
}

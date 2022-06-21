const sdk = require("@defillama/sdk");
const { toBigNumberJsOrZero } = require("./utils.js");

const addressProviderABI = require("./abi/addressProvider.json");
const registryABI = require("./abi/registry.json");
const { ADDRESS_PROVIDER_ADDRESS, ZERO_ADDRESS, transformTokenAddress } = require("./addresses");

const getBalances = async (chain, block) => {
  const registryAddress = (await sdk.api.abi.call({
    target: ADDRESS_PROVIDER_ADDRESS,
    abi: addressProviderABI["get_registry"],
    block,
    chain,
  })).output

  const poolAddresses = await listPoolAddresses(chain, block, registryAddress)

  const poolCoinsArray = (await sdk.api.abi.multiCall({
    calls: poolAddresses.map(address => ({ target: registryAddress, params: address })),
    abi: registryABI["get_coins"],
    block,
    chain,
  })).output.map(({ output }) => output.filter(address => address !== ZERO_ADDRESS))

  const poolBalancesArray = (await sdk.api.abi.multiCall({
    calls: poolAddresses.map(address => ({ target: registryAddress, params: address })),
    abi: registryABI["get_balances"],
    block,
    chain,
  })).output.map(({ output }) => output)

  const balanceBNRecord = poolCoinsArray.reduce(
    (result, coins, poolIndex) => 
      coins.reduce((coinsResult, coin, coinIndex) => {
        const balance = toBigNumberJsOrZero(poolBalancesArray[poolIndex][coinIndex])
        const transformedCoin = transformTokenAddress(coin)
        const exisitingBalance = coinsResult[transformedCoin]
        if(!transformedCoin) return coinsResult
        if(!exisitingBalance)
            return { ...coinsResult, [transformedCoin]: balance }
        return { ...coinsResult, [transformedCoin]: exisitingBalance.plus(balance) }
      }, result),
    {}
  )

  return Object.keys(balanceBNRecord).reduce((result, key) => ({
    ...result,
    [key]: key.startsWith("0x")
      ? balanceBNRecord[key].toString()
      : balanceBNRecord[key].shiftedBy(-18)
  }), {})
}

const listPoolAddresses = async (chain, block, registryAddress) => {
  const numOfPools = (await sdk.api.abi.call({
    target: registryAddress,
    abi: registryABI["pool_count"],
    block,
    chain,
  })).output
  const poolAddressesCalls = []
  for (let i = 0; i < numOfPools; i++) {
    poolAddressesCalls.push({ target: registryAddress, params: i })
  }
  return (await sdk.api.abi.multiCall({
    calls: poolAddressesCalls,
    abi: registryABI["pool_list"],
    block,
    chain,
  })).output.map(({ output }) => output)
}

module.exports = {
  getBalances
}

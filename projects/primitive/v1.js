const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const BigNumber = require('bignumber.js')
const getCacheBalances = 'function getCacheBalances() view returns (uint256, uint256)'
const getUnderlyingTokenAddress = "address:getUnderlyingTokenAddress"
const getStrikeTokenAddress = "address:getStrikeTokenAddress"
const redeemToken = "address:redeemToken"
const getPair = 'function getPair(address, address) view returns (address)'
const token0 = 'address:token0'
const token1 = 'address:token1'
const getReserves = 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)'
const { getLogs } = require('../helper/cache/getLogs')

const START_BLOCK = 11142900
const REGISTRY = '0x16274044dab9635Df2B5AeAF7CeCb5f381c71680'
const FACTORY = '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac'
const ZERO_ADDRESS = ADDRESSES.null

module.exports = async function tvl(api) {
  const block = api.block

  const logs = (
    await getLogs({
      api,
      target: REGISTRY,
      fromBlock: START_BLOCK,
      topic: 'DeployedOptionClone(address,address,address)',
    })
  )

  const optionAddresses = logs
    .map((log) => `0x${log.topics[2].substring(26)}`)
    .map((optionAddress) => optionAddress.toLowerCase())

  const allRedeemAddresses = logs
    .map((log) => `0x${log.topics[3].substring(26)}`)
    .map((redeemAddress) => redeemAddress.toLowerCase())

  const [
    underlyingAddresses,
    strikeAddresses,
    redeemAddresses,
  ] = await Promise.all([
    sdk.api.abi
      .multiCall({
        abi: getUnderlyingTokenAddress,
        calls: optionAddresses.map((optionAddress) => ({
          target: optionAddress,
        })),
        block,
      })
      .then(({ output }) => output),
    sdk.api.abi
      .multiCall({
        abi: getStrikeTokenAddress,
        calls: optionAddresses.map((optionAddress) => ({
          target: optionAddress,
        })),
        block,
      })
      .then(({ output }) => output),
    sdk.api.abi
      .multiCall({
        abi: redeemToken,
        calls: optionAddresses.map((optionAddress) => ({
          target: optionAddress,
        })),
        block,
      })
      .then(({ output }) => output),
  ])

  const options = {}
  // add underlyingAddresses
  underlyingAddresses.forEach((underlyingAddress) => {
      const tokenAddress = underlyingAddress.output.toLowerCase()

        const optionAddress = underlyingAddress.input.target.toLowerCase()
        options[optionAddress] = {
          underlyingAddress: tokenAddress,
        }
  })

  // add strikeAddresses
  strikeAddresses.forEach((strikeAddress) => {
      const tokenAddress = strikeAddress.output.toLowerCase()
        const optionAddress = strikeAddress.input.target.toLowerCase()
        options[optionAddress] = {
          ...(options[optionAddress] || {}),
          strikeAddress: tokenAddress,
        }
  })

  redeemAddresses.forEach((redeemAddress) => {
      const tokenAddress = redeemAddress.output.toLowerCase()
      const optionAddress = redeemAddress.input.target.toLowerCase()
      options[optionAddress] = {
        ...(options[optionAddress] || {}),
        redeemAddress: tokenAddress,
      }
  })

  // The internally tracked balances of underlying and strike tokens in the Primitive option contracts
  const caches = (
    await sdk.api.abi.multiCall({
      abi: getCacheBalances,
      calls: Object.keys(options).map((optionAddress) => ({
        target: optionAddress,
      })),
      block,
    })
  ).output

  // ===== Sushiswap Pools =====

  const optionPairAddresses = (
    await sdk.api.abi.multiCall({
      abi: getPair,
      calls: Object.keys(options).map((optionAddress, i) => ({
        target: FACTORY,
        params: [
          options[optionAddress].underlyingAddress,
          options[optionAddress].redeemAddress,
        ],
      })),
      block,
    })
  ).output

  const optionPairs = []

  optionPairAddresses.forEach((optionPairAddress) => {
      const marketAddress = optionPairAddress.output.toLowerCase()
      if (marketAddress !== ZERO_ADDRESS) optionPairs.push(marketAddress)
  })

  const [token0Addresses, token1Addresses] = await Promise.all([
    sdk.api.abi
      .multiCall({
        abi: token0,
        calls: optionPairs.map((marketAddress) => ({
          target: marketAddress,
        })),
        block,
      })
      .then(({ output }) => output),
    sdk.api.abi
      .multiCall({
        abi: token1,
        calls: optionPairs.map((marketAddress) => ({
          target: marketAddress,
        })),
        block,
      })
      .then(({ output }) => output),
  ])

  const pairs = {}
  // add token0Addresses
  token0Addresses.forEach((token0Address) => {
      const tokenAddress = token0Address.output.toLowerCase()

      if (
        allRedeemAddresses.indexOf(tokenAddress) != -1
      ) {
        const pairAddress = token0Address.input.target.toLowerCase()
        pairs[pairAddress] = {
          token0Address: tokenAddress,
        }
      }
  })

  // add token1Addresses
  token1Addresses.forEach((token1Address) => {
      const tokenAddress = token1Address.output.toLowerCase()
      if (
        allRedeemAddresses.indexOf(tokenAddress) != -1
      ) {
        const pairAddress = token1Address.input.target.toLowerCase()
        pairs[pairAddress] = {
          ...(pairs[pairAddress] || {}),
          token1Address: tokenAddress,
        }
      }
  })

  // Reserves of option pools in Sushiswap
  const reserves = (
    await sdk.api.abi.multiCall({
      abi: getReserves,
      calls: Object.keys(pairs).map((pairAddress) => ({
        target: pairAddress,
      })),
      block,
    })
  ).output

  // ===== Accumulators =====

  // accumulate the balances in the Sushiswap option pools
  const inSushiSwap = reserves.reduce((accumulator, reserve, i) => {
      const pairAddress = reserve.input.target.toLowerCase()
      const pair = pairs[pairAddress] || {}

      // handle reserve0
      if (pair.token0Address) {
        const reserve0 = new BigNumber(reserve.output['0'])
        if (!reserve0.isZero()) {
          const existingBalance = new BigNumber(
            accumulator[pair.token0Address] || '0'
          )

          accumulator[pair.token0Address] = existingBalance
            .plus(reserve0)
            .toFixed()
        }
      }

      // handle reserve1
      if (pair.token1Address) {
        const reserve1 = new BigNumber(reserve.output['1'])

        if (!reserve1.isZero()) {
          const existingBalance = new BigNumber(
            accumulator[pair.token1Address] || '0'
          )

          accumulator[pair.token1Address] = existingBalance
            .plus(reserve1)
            .toFixed()
        }
      }

    return accumulator
  }, {})

  // accumulate the caches of Primitive with the reserves of Sushiswap
  return caches.reduce((accumulator, cache, i) => {
      const optionAddress = cache.input.target.toLowerCase()
      const option = options[optionAddress] || {}

      // handle underlyingCache
      if (option.underlyingAddress) {
        const underlyingCache = new BigNumber(cache.output['0'])

        const existingBalance = new BigNumber(
          accumulator[option.underlyingAddress] || '0'
        )

        accumulator[option.underlyingAddress] = existingBalance
          .plus(underlyingCache)
          .toFixed()
      }

      // handle strikeCache
      if (option.strikeAddress) {
        const strikeCache = new BigNumber(cache.output['1'])

        const existingBalance = new BigNumber(
          accumulator[option.strikeAddress] || '0'
        )

        accumulator[option.strikeAddress] = existingBalance
          .plus(strikeCache)
          .toFixed()
      }

    return accumulator
  }, inSushiSwap)
}

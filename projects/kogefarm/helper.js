const BigNumber = require('bignumber.js')
const sdk = require('@defillama/sdk')
const abi = require('./abi.json')
const { unwrapCrv } = require('../helper/unwrapLPs')

function transformAddressKF(chain = 'polygon') {
  return (addr) => {
    if (addr.toLowerCase() === '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619') {
      return '0x0000000000000000000000000000000000000000'
    }
    return `${chain}:${addr}`
  }
}

async function getSinglePositions(
  balances,
  lpPositions,
  block,
  chain = 'ethereum',
  transformAddress = (addr) => addr,
) {
  await Promise.all(
    lpPositions.map((lpPosition) => {
      const underlyingToken = lpPosition.token
      const underlyingTokenBalance = lpPosition.balance
      sdk.util.sumSingleBalance(
        balances,
        transformAddress(underlyingToken),
        underlyingTokenBalance,
      )
    }),
  )
}

async function unwrapCrvLPs(
  balances,
  lpPositions,
  block,
  chain = 'ethereum',
  transformAddress = (addr) => addr,
) {
  await Promise.all(
    lpPositions.map(async (lp) => {
      try {
        await unwrapCrv(balances, lp, block, chain, transformAddress)
      } catch (e) {
        console.log(
          `Failed to get data for LP token at ${lpPosition.token} on chain ${chain}`,
        )
        throw e
      }
    }),
  )
}

async function unwrapBalancerLPs(
  vaultAddress,
  balances,
  lpPositions,
  block,
  chain = 'ethereum',
  transformAddress = (addr) => addr,
) {
  const vaultBalances = (
    await sdk.api.abi.multiCall({
      chain,
      block,
      abi: abi.balance,
      calls: lpPositions.map((lp) => ({ target: lp.vaultAddr })),
    })
  ).output
  const poolIds = (
    await sdk.api.abi.multiCall({
      chain,
      block,
      abi: abi.getPoolId,
      calls: lpPositions.map((lp) => ({ target: lp.token })),
    })
  ).output
  const poolTokens = (
    await sdk.api.abi.multiCall({
      chain,
      block,
      abi: abi.getPoolTokens,
      calls: poolIds.map((e) => ({ target: vaultAddress, params: [e.output] })),
    })
  ).output
  const totalSupply = (
    await sdk.api.abi.multiCall({
      chain,
      block,
      abi: abi.totalSupply,
      calls: lpPositions.map((e) => ({ target: e.token })),
    })
  ).output

  console.log(vaultBalances[0].output)
  console.log(totalSupply[0].output)
  console.log(poolTokens[0].output['1'][0])

  await Promise.all(
    poolTokens.map(async (lp, idx) => {
      try {
        const token0 = lp.output.tokens[0]
        const token1 = lp.output.tokens[1]

        // Not correct calculations
        const token0Balance = new BigNumber(lp.output['1'][0])
          .times(
            BigNumber(lpPositions[idx].balance).div(totalSupply[idx].output),
          )
          .integerValue()

        const token1Balance = new BigNumber(lp.output['1'][1])
          .times(
            BigNumber(lpPositions[idx].balance).div(totalSupply[idx].output),
          )
          .integerValue()

        console.log(token0)
        console.log(token1)
        console.log(lp.output['1'][0].toString())
        console.log(lp.output['1'][1].toString())

        sdk.util.sumSingleBalance(
          balances,
          await transformAddress(token0.toLowerCase()),
          token0Balance.toFixed(0),
        )
        sdk.util.sumSingleBalance(
          balances,
          await transformAddress(token1.toLowerCase()),
          token1Balance.toFixed(0),
        )
      } catch (e) {
        console.log(
          `Failed to get data for LP token at ${lpPositions[idx].token} on chain ${chain}`,
        )
        throw e
      }
    }),
  )
}

module.exports = {
  transformAddressKF,
  getSinglePositions,
  unwrapBalancerLPs,
  unwrapCrvLPs,
}

const BigNumber = require('bignumber.js')
const sdk = require('@defillama/sdk')
const abi = require('./abi.json')
const { unwrapCrv } = require('../helper/unwrapLPs')

function transformAddressKF(chain = 'polygon') {
  return (addr) => {
    if (addr.toLowerCase() === '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619') {
      return '0x0000000000000000000000000000000000000000'
    }
    // Special case for fUSDT, since coingecko doesn't find it on Fantom
    if (addr.toLowerCase() === '0x049d68029688eabf473097a2fc38ef61633a3c7a') {
      // USDT
      return `ethereum:0xdac17f958d2ee523a2206206994597c13d831ec7`
    }
    // Special case for MIM, since coingecko doesn't find it on Fantom
    if (addr.toLowerCase() === '0x82f0b8b456c1a451378467398982d4834b6829c1') {
      // MIM
      return `ethereum:0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3`
    }
    // Special case for LINK, since coingecko doesn't find it on Fantom
    if (addr.toLowerCase() === '0xb3654dc3d10ea7645f8319668e8f54d2574fbdc8') {
      // LINK
      return `ethereum:0x514910771af9ca656af840dff83e8264ecf986ca`
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

  await Promise.all(
    poolTokens.map(async (lp, idx) => {
      try {
        const tokens = lp.output.tokens

        const tokenBalances = tokens.map((t, tidx) =>
          BigNumber(lp.output['1'][tidx])
            .times(
              BigNumber(lpPositions[idx].balance).div(totalSupply[idx].output),
            )
            .integerValue(),
        )

        tokenBalances.forEach(async (tokenBalance, tidx) => {
          sdk.util.sumSingleBalance(
            balances,
            await transformAddress(tokens[tidx].toLowerCase()),
            tokenBalance.toFixed(0),
          )
        })
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

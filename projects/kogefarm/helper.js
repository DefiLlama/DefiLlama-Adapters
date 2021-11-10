const BigNumber = require('bignumber.js')
const sdk = require('@defillama/sdk')
const abi = require('./abi.json')
const { unwrapCrv } = require('../helper/unwrapLPs')

function transformAddressKF(chain = 'polygon') {
  return (addr) => {
    // WETH
    if (addr.toLowerCase() === '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619') {
      return '0x0000000000000000000000000000000000000000'
    }

    // Special cases since coingecko doesn't find them
    if (
      // fUSDT
      (chain === 'fantom' &&
        addr.toLowerCase() === '0x049d68029688eabf473097a2fc38ef61633a3c7a') ||
      (chain === 'moonriver' &&
        addr.toLowerCase() === '0xe936caa7f6d9f5c9e907111fcaf7c351c184cda7')
    ) {
      // USDT
      return `ethereum:0xdac17f958d2ee523a2206206994597c13d831ec7`
    }
    if (
      // Dai on Fantom
      (chain === 'fantom' &&
        addr.toLowerCase() === '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e')
    ) {
      // Dai on Eth
      return `ethereum:0x6b175474e89094c44da98b954eedeac495271d0f`
    }
    if (
      // wMemo on Fantom
      (chain === 'fantom' &&
        addr.toLowerCase() === '0xddc0385169797937066bbd8ef409b5b3c0dfeb52')
    ) {
      // Time on avax (per Wonderland docs, staked time = Memo at a 1:1 ratio)
      return `avax:0xb54f16fb19478766a268f172c9480f8da1a7c9c3`
    }
    if (
      chain === 'moonriver' &&
      addr.toLowerCase() === '0x748134b5f553f2bcbd78c6826de99a70274bdeb3' // USDC.m
    ) {
      // USDC
      return `ethereum:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48`
    }
    if (
      chain === 'moonriver' &&
      addr.toLowerCase() === '0x15b9ca9659f5dff2b7d35a98dd0790a3cbb3d445' // DOT.m
    ) {
      // BSC DOT
      return `bsc:0x7083609fce4d1d8dc0c979aab8c869ea2c873402`
    }
    if (
      chain === 'moonriver' &&
      addr.toLowerCase() === '0x9a92b5ebf1f6f6f7d93696fcd44e5cf75035a756' // FINN
    ) {
      // FINN
      return `moonriver:0x9a92b5ebf1f6f6f7d93696fcd44e5cf75035a756`
    }
    if (
      chain === 'moonriver' &&
      addr.toLowerCase() === '0x576fde3f61b7c97e381c94e7a03dbc2e08af1111' // ETH.M
    ) {
      // WETH
      return `ethereum:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2`
    }
    if (
      chain === 'moonriver' &&
      addr.toLowerCase() === '0x78f811a431d248c1edcf6d95ec8551879b2897c3' // BTC.m
    ) {
      // WBTC
      return `ethereum:0x2260fac5e5542a773aa44fbcfedf7c193bc2c599`
    }
    if (
      chain === 'moonriver' &&
      addr.toLowerCase() === '0x9d5bc9b873aed984e2b6a64d4792249d68bba2fe' // XRP.m
    ) {
      // Binance-Peg XRP
      return `bsc:0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe`
    }
    if (
      chain === 'moonriver' &&
      addr.toLowerCase() === '0xc005a7a1502c9de16ccdaba7cda0cee4ac304993' // AVAX.m
    ) {
      // WAVAX
      return `avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7`
    }
    // Special case for MIM, since coingecko doesn't find
    if (addr.toLowerCase() === '0x82f0b8b456c1a451378467398982d4834b6829c1') {
      // MIM
      return `ethereum:0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3`
    }
    // Special case for LINK, since coingecko doesn't find
    if (addr.toLowerCase() === '0xb3654dc3d10ea7645f8319668e8f54d2574fbdc8') {
      // LINK
      return `ethereum:0x514910771af9ca656af840dff83e8264ecf986ca`
    }
    // Special case for Bella, since coingecko doesn't find
    if (
      chain === 'polygon' &&
      addr.toLowerCase() === '0x28c388fb1f4fa9f9eb445f0579666849ee5eeb42') {
      return `ethereum:0xa91ac63d040deb1b7a5e4d4134ad23eb0ba07e14`
    }
    // Special case for SFI, since coingecko doesn't find
    if (
      chain === 'polygon' &&
      addr.toLowerCase() === '0x35b937583f04a24963eb685f728a542240f28dd8') {
      return `ethereum:0xb753428af26e81097e7fd17f40c88aaa3e04902c`
    }
    // Special case for Impermax, since coingecko doesn't find
    if (
      chain === 'polygon' &&
      addr.toLowerCase() === '0x60bb3d364b765c497c8ce50ae0ae3f0882c5bd05') {
      return `ethereum:0x7b35ce522cb72e4077baeb96cb923a5529764a00`
    }
    // Special case for Avax, since coingecko doesn't find
    if (
      chain === 'polygon' &&
      addr.toLowerCase() === '0x2c89bbc92bd86f8075d1decc58c7f4e0107f286b') {
      return `avax:FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z`
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
  excludeTokensRaw=[]
) {
  await Promise.all(
    lpPositions.map(async (lp) => {
      try {
        await unwrapCrv(balances, lp, block, chain, transformAddress, excludeTokensRaw)
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

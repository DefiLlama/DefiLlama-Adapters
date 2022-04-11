const { fetchURL } = require('../helper/utils')
const { getChainTvl } = require('../helper/getUniSubgraphTvl')
const { staking } = require('../helper/staking')
const sdk = require('@defillama/sdk')
const BigNumber = require("bignumber.js")
const { toUSDTBalances } = require('../helper/balances')

const masterchef = "0x4e864e36bb552bd1bf7bcb71a25d8c96536af7e3"
const factory = "0xd654cbf99f2907f06c88399ae123606121247d5c"
const dividendPools = "0xe49cc2ff620bf43d0d3eada59000bc79a3c0a553"

async function oecTvl(timestamp, ethBlock, chainBlocks) {
    const response = await fetchURL('https://api.jswap.finance/stats/oec/tvl')

    const liquidityTvl = Number(response.data.totalLiquidityUSD)
    return toUSDTBalances(liquidityTvl)
}

// This combines masterchef into staking but separating them is very difficult
async function oecStaking(timestamp, ethBlock, chainBlocks) {
  const response = await fetchURL('https://api.jswap.finance/stats/oec/tvl')

  const tokensTvl = Number(response.data.totalTokenStakedUSD)
  const dividendTvl = Number(response.data.totalDividendStakedUSD)

  const totalStaking = tokensTvl + dividendTvl

  return toUSDTBalances(totalStaking)
}

const graphUrls = {
    okexchain: 'https://graph.jswap.finance/subgraphs/name/jswap-finanace/jswap-subgraph'
}
const chainTvls = getChainTvl(graphUrls, 'jswapFactories')

module.exports = {
    misrepresentedTokens: true,
    methodology: 'TVL counts the liquidity of Jswap DEX and staking counts the tokens and the JF in dividend pool that has been staked. Data is pulled from:"https://api.jswap.finance/stats/oec/tvl"',
    okexchain: {
        tvl: chainTvls("okexchain"),
        staking: oecStaking
    },
}

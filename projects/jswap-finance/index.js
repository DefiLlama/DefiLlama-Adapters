const { fetchURL } = require('../helper/utils')
const { getChainTvl } = require('../helper/getUniSubgraphTvl')
const { staking } = require('../helper/staking')
const sdk = require('@defillama/sdk')
const BigNumber = require("bignumber.js")

async function oecTvl(timestamp, ethBlock, chainBlocks) {
    const response = await fetchURL('https://api.jswap.finance/stats/oec/tvl')

    const liquidityTvl = new BigNumber(response.data.totalLiquidityUSD)
    const tokensTvl = new BigNumber(response.data.totalTokenStakedUSD)
    const dividendTvl = new BigNumber(response.data.totalDividendStakedUSD)

    const totalTvl = liquidityTvl.plus(tokensTvl).plus(dividendTvl)

    return totalTvl.toFixed(2)
}

async function oecStaking(timestamp, ethBlock, chainBlocks) {
  const response = await fetchURL('https://api.jswap.finance/stats/oec/tvl')

  const tokensTvl = new BigNumber(response.data.totalTokenStakedUSD)
  const dividendTvl = new BigNumber(response.data.totalDividendStakedUSD)

  const totalStaking = tokensTvl.plus(dividendTvl)

  return totalStaking.toFixed(2)
}

const graphUrls = {
    okexchain: 'https://graph.jswap.finance/subgraphs/name/jswap-finanace/jswap-subgraph'
}
const chainTvls = getChainTvl(graphUrls, 'jswapFactories')

module.exports = {
    misrepresentedTokens: true,
    methodology: 'TVL counts the liquidity of Jswap DEX and staking counts the tokens and the JF in dividend pool that has been staked. Data is pulled from:"https://api.jswap.finance/stats/oec/tvl"',
    tvl: sdk.util.sumChainTvls([oecTvl]),
    okexchain: {
        tvl: oecTvl
    },
    staking: {
        tvl: oecStaking
    }
}

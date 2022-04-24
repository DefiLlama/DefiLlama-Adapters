const { request, gql } = require('graphql-request');
const BigNumber = require('bignumber.js');

const usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7';
const toUSDT = (value, times = 1e6) => BigNumber(value).times(times).toFixed(0);
const toUSDTBalances = (value, times = 1e6) => ({
  [usdtAddress]: toUSDT(value, times)
});

const graphEndpoint = 'https://graphapi.hoosmartchain.com/subgraphs/name/pudding/exchange'
const currentQuery = gql`
query uniswapDayDatas {
  uniswapDayDatas(
    orderBy:date
    orderDirection:desc
    first:1
  ) {
    totalLiquidityUSD
  }
}
`
async function tvl(timestamp, ethBlock, chainBlocks) {
  const tvl = await request(graphEndpoint, currentQuery, {}, {
    'referer': 'https://info.puddingswap.finance/',
    'origin': 'https://info.puddingswap.finance',
  })
  const balances = toUSDTBalances(tvl.uniswapDayDatas[0].totalLiquidityUSD)
  return balances
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  // methodology: 'TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://info.puddingswap.finance/ as the source. Staking accounts for the PUD locked in MasterChef (0x26eE42a4DE70CEBCde40795853ebA4E492a9547F)',
  hoo: {
    tvl
  }
}

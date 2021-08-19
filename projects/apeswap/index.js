const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');

const BANANA_TOKEN = '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95'
const MASTER_APE = '0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9'
const FACTORY_BSC = "0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6";
const FACTORY_POLYGON = "0xcf083be4164828f00cae704ec15a36d711491284";

const SUBGRAPH_BSC = "https://graph2.apeswap.finance/subgraphs/name/ape-swap/apeswap-subgraph"
const SUBGRAPH_POLYGON = "https://api.thegraph.com/subgraphs/name/apeswapfinance/dex-polygon" 

const liquidityQuery = gql`
query get_tvl($block: Int, $id: String) {
  uniswapFactory(
    id: $id,
    block: { number: $block }
  ) {
    totalVolumeUSD
    totalLiquidityUSD
  }
}
`;

async function bscTvl(timestamp, block, chainBlocks) {
  const {uniswapFactory} = await request(
    SUBGRAPH_BSC,
    liquidityQuery,
    {
      block: chainBlocks['bsc'],
      id: FACTORY_BSC
    }
  );
  const usdTvl = Number(uniswapFactory.totalLiquidityUSD)

  return toUSDTBalances(usdTvl)
}

async function polygonTvl(timestamp, block, chainBlocks) {
  const {uniswapFactory} = await request(
    SUBGRAPH_POLYGON,
    liquidityQuery,
    {
      block: chainBlocks['polygon'],
      id: FACTORY_POLYGON
    }
  );
  const usdTvl = Number(uniswapFactory.totalLiquidityUSD)

  return toUSDTBalances(usdTvl)
}

async function poolsTvl(timestamp, ethBlock, chainBlocks) {
    const balances = {};
    const stakedBanana = sdk.api.erc20.balanceOf({
      target: BANANA_TOKEN,
      owner: MASTER_APE,
      chain: 'bsc',
      block: chainBlocks.bsc
    })
    sdk.util.sumSingleBalance(balances, 'bsc:' + BANANA_TOKEN, (await stakedBanana).output)
    return balances
}

module.exports = {
  misrepresentedTokens: true,
  bsc:{
    tvl: bscTvl,
  },
  polygon:{
    tvl: polygonTvl,
  },
  staking:{
    tvl: poolsTvl,
  },
  methodology: "TVL is extracted from the subgraphs, staking TVL is accounted as the banana on 0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9",
  tvl: sdk.util.sumChainTvls([polygonTvl, bscTvl])
}
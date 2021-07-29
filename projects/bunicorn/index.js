const BigNumber = require("bignumber.js");
const {toUSDTBalances} = require('../helper/balances');
const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");

const tokenSubgraphUrl = 'https://graph.bunicorn.exchange/subgraphs/name/bunicorndefi/buni-token';
const stableSubgraphUrl = 'https://api.thegraph.com/subgraphs/name/bunicorndefi/buni-stablecoins';
const BUNI_CONTRACT_ADDRESS = '0x0e7beec376099429b85639eb3abe7cf22694ed49';
const MASTERCHET_CONTRACT_ADDRESS = '0xA12c974fE40ea825E66615bA0Dc4Fd19be4D7d24';

const graphTotalTokenTVLQuery = gql`
query GET_TOTAL_TOKEN_TVL($block: Int) {
  bunis(
    where: { id: 1 },
    block: { number: $block }
  ) {
    totalLiquidity
  }
}
`;

const graphTotalStableTVLQuery = gql`
query GET_TOTAL_STABLE_TVL($block: Int) {
  buniCornFactories(where: {id: "0x86873f85bc12ce40321340392c0ff39c3bdb8d68"}, block: { number: $block }) {
    id
    totalLiquidityUSD
  }
}
`;


async function getTotalFarmTVL(timestamp, ethBlock, chainBlocks) {
  try {
    const block = chainBlocks.bsc
    const result = await sdk.api.abi.multiCall({
      calls: [
        {
          target: BUNI_CONTRACT_ADDRESS,
          params: [MASTERCHET_CONTRACT_ADDRESS]
        }
      ],
      block,
      abi: abi.balanceOf,
      chain: 'bsc'
    })
    const balance = result.output[0] && result.output[0].output;
    const buniPrice = await getBuniPrice(chainBlocks);

    return new BigNumber(balance).div(1e18).times(buniPrice);
  } catch (e) {
    throw new Error('getTotalFarmTVL has exception:' + e.message);
  }
}


async function getTotalTokenTVL(timestamp, ethBlock, chainBlocks) {
  try {
    const { bunis } = await request(
      tokenSubgraphUrl,
      graphTotalTokenTVLQuery,
      {
        block: chainBlocks.bsc
      }
    );

    return bunis[0] && bunis[0].totalLiquidity || 0;
  } catch (e) {
    throw new Error('getTotalTokenTVL has exception:' + e.message);
  }
}

async function getTotalStableTVL(timestamp, ethBlock, chainBlocks) {
  try {
    const { buniCornFactories } = await request(
      stableSubgraphUrl,
      graphTotalStableTVLQuery,
      {
        block: chainBlocks.bsc
      }
    );

    return buniCornFactories[0] && buniCornFactories[0].totalLiquidityUSD || 0;
  } catch (e) {
    throw new Error('getTotalStableTVL has exception:' + e.message);
  }
}

async function getTotalTVL(timestamp, ethBlock, chainBlocks) {
  const [tokensSummary, stableSummary] = await Promise.all([
    getTotalTokenTVL(timestamp, ethBlock, chainBlocks),
    getTotalStableTVL(timestamp, ethBlock, chainBlocks)
  ]);

  return toUSDTBalances(new BigNumber(tokensSummary).plus(stableSummary));
}

module.exports = {
  bsc:{
    tvl: getTotalTVL
  },
  staking:{
    tvl: getTotalFarmTVL,
  },
  tvl: sdk.util.sumChainTvls([getTotalTVL, getTotalFarmTVL])
}


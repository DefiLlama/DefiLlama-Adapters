const { request, gql } = require("graphql-request");
const dayjs = require("dayjs");
const { getBlock } = require("../helper/getBlock");
const { toUSDTBalances } = require("../helper/balances");

const GET_BLOCK = gql`
  query blocks($timestampFrom: Int!, $timestampTo: Int!) {
    blocks(
      first: 1
      orderBy: timestamp
      orderDirection: asc
      where: { timestamp_gt: $timestampFrom, timestamp_lt: $timestampTo }
    ) {
      id
      number
      timestamp
    }
  }
`;

async function getLatestBlock(timestamp) {
  //  a few blocks behind the blockchain,so we write a hack here
  const utcCurrentTime = timestamp ?? dayjs().unix() - 100;
  const res = await request(
    "https://thegraph.kcc.network/subgraphs/name/kcc-blocks",
    GET_BLOCK,
    {
      timestampFrom: utcCurrentTime,
      timestampTo: utcCurrentTime + 600,
    }
  );
  const block =
    res?.blocks[0]?.number ?? (await getLatestBlock(dayjs().unix() - 500));
  return Number(block);
}

function getChainTvl(
  graphUrls,
  factoriesName = "uniswapFactories",
  tvlName = "totalLiquidityUSD"
) {
  const graphQuery = gql`
query get_tvl($block: Int) {
  ${factoriesName}(
    block: { number: $block }
  ) {
    ${tvlName}
  }
}
`;
  return (chain) => {
    return async (timestamp, ethBlock, chainBlocks) => {
      let block = await getBlock(timestamp, chain, chainBlocks);
      const latestBlock = await getLatestBlock();
      if (Number(block) > latestBlock) {
        block = latestBlock;
      }
      const uniswapFactories = (
        await request(graphUrls[chain], graphQuery, {
          block,
        })
      )[factoriesName];
      const usdTvl = Number(uniswapFactories[0][tvlName]);
      return toUSDTBalances(usdTvl);
    };
  };
}

module.exports = {
  getChainTvl,
};

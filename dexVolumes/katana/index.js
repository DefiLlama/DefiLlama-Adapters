const { request, gql } = require("graphql-request");

const {
  getChainVolume,
  DEFAULT_TOTAL_VOLUME_FIELD,
  DEFAULT_DAILY_VOLUME_FIELD,
} = require("../helper/getUniSubgraphVolume");

const endpoints = {
  ronin:
    "https://thegraph.roninchain.com/subgraphs/name/axieinfinity/katana-subgraph-green",
};

const blocksGraph =
  "https://thegraph.roninchain.com/subgraphs/name/axieinfinity/ronin-blocks";

const blockQuery = gql`
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
      __typename
    }
  }
`;

const getCustomBlock = async (timestamp) => {
  const block = Number(
    (
      await request(blocksGraph, blockQuery, {
        timestampFrom: timestamp - 30,
        timestampTo: timestamp + 30,
      })
    ).blocks[0].number
  );

  return block;
};

const graphs = getChainVolume({
  graphUrls: {
    ronin: endpoints.ronin,
  },
  totalVolume: {
    factory: "katanaFactories",
    field: DEFAULT_TOTAL_VOLUME_FIELD,
  },
  dailyVolume: {
    factory: "katanaDayData",
    field: DEFAULT_DAILY_VOLUME_FIELD,
  },
  getCustomBlock,
});

module.exports = {
  volume: {
    ronin: graphs("ronin"),
  },
};

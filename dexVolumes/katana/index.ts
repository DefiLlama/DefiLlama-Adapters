import { DexVolumeAdapter } from "../dexVolume.type";

const { request, gql } = require("graphql-request");
const { RONIN } = require("../helper/chains");
const { getStartTimestamp } = require("../helper/getStartTimestamp");
const {
  getChainVolume,
  DEFAULT_TOTAL_VOLUME_FIELD,
  DEFAULT_DAILY_VOLUME_FIELD,
} = require("../helper/getUniSubgraphVolume");

const endpoints = {
  [RONIN]:
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

const getCustomBlock = async (timestamp: number) => {
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

const DAILY_VOLUME_FACTORY = "katanaDayData";

const graphs = getChainVolume({
  graphUrls: {
    [RONIN]: endpoints[RONIN],
  },
  totalVolume: {
    factory: "katanaFactories",
    field: DEFAULT_TOTAL_VOLUME_FIELD,
  },
  dailyVolume: {
    factory: DAILY_VOLUME_FACTORY,
    field: DEFAULT_DAILY_VOLUME_FIELD,
  },
  getCustomBlock,
});

const adapter: DexVolumeAdapter = {
  volume: {
    [RONIN]: {
      fetch: graphs(RONIN),
      start: getStartTimestamp({
        endpoints,
        chain: RONIN,
        dailyDataField: `${DAILY_VOLUME_FACTORY}s`,
      }),
    },
  },
};

export default adapter;

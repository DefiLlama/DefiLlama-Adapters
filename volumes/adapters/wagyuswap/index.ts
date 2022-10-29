const { request, gql } = require("graphql-request");
import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import { DEFAULT_DAILY_VOLUME_FIELD, DEFAULT_TOTAL_VOLUME_FIELD, getChainVolume } from "../../helper/getUniSubgraphVolume";

const blocksGraph = "https://thegraph3.wagyuswap.app/subgraphs/name/wagyu";
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

const DAY_IN_SECONDS = 60 * 60 * 24
const getCustomBlock = async (timestamp: number) => {
  const block = Number(
    (
      await request(blocksGraph, blockQuery, {
        timestampFrom: timestamp - DAY_IN_SECONDS,
        timestampTo: timestamp + DAY_IN_SECONDS,
      })
    ).blocks[0].number
  );
  return block;
};

const graphs = getChainVolume({
  graphUrls: {
    [CHAIN.VELAS]: "https://thegraph3.wagyuswap.app/subgraphs/name/wagyu"
  },
  totalVolume: {
    factory: "pancakeFactories",
    field: DEFAULT_TOTAL_VOLUME_FIELD,
  },
  dailyVolume: {
    factory: "pancakeDayData",
    field: DEFAULT_DAILY_VOLUME_FIELD,
  },
  getCustomBlock,
});

const adapter: SimpleVolumeAdapter = {
  volume: {
    [CHAIN.VELAS]: {
      fetch: graphs(CHAIN.VELAS),
      start: async () => 1635653053,
    },
  },
};

export default adapter;

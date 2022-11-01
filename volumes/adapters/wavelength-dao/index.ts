const { request, gql } = require("graphql-request");
import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import customBackfill, { IGraphs } from "../../helper/customBackfill";
import { getStartTimestamp } from "../../helper/getStartTimestamp";
import { getChainVolume } from "../../helper/getUniSubgraphVolume";

const blocksGraph = "https://testeborabora.cyou/subgraphs/name/blocks";
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

const endpoints = {
  [CHAIN.VELAS]: "https://testeborabora.cyou/subgraphs/name/wavelength22"
}
const graphs = getChainVolume({
  graphUrls: endpoints,
  totalVolume: {
    factory: "balancers",
    field: "totalSwapVolume",
  },
  dailyVolume: {
    factory: "balancerSnapshot",
    field: "totalSwapVolume",
    dateField: "timestamp"
  },
  getCustomBlock,
});

const adapter: SimpleVolumeAdapter = {
  volume: {
    [CHAIN.VELAS]: {
      fetch: graphs(CHAIN.VELAS),
      start: getStartTimestamp({
        endpoints,
        chain: CHAIN.VELAS,
        dailyDataField: `balancerSnapshots`,
        dateField: 'timestamp',
        volumeField: 'totalSwapVolume'
      }),
      customBackfill: customBackfill(CHAIN.VELAS, graphs as unknown as IGraphs)
    },
  },
};

export default adapter;

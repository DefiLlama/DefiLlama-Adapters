import { gql, GraphQLClient } from "graphql-request";
import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";

const getDailyVolume = () => {
  return gql` query value {
      summation {
          tradingVolume1D
          totalValueLocked
          totalVirtualLocked
      }
  }`
}

const graphQLClient = new GraphQLClient("https://api.pangeaswap.com/graphql");

const getGQLClient = () => {
  return graphQLClient
}

const fetch = async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000));
  const dailyVolume = (await getGQLClient().request(getDailyVolume()))?.summation?.tradingVolume1D;

  return {
    timestamp: dayTimestamp,
    dailyVolume: dailyVolume ? dailyVolume.toString() : undefined,
  }
}

const adapter: SimpleVolumeAdapter = {
  volume: {
    [CHAIN.KLAYTN]: {
      fetch,
      runAtCurrTime: true,
      start: async () => 0,
      customBackfill: undefined
    },
  },
};

export default adapter;

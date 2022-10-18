import { Chain } from "@defillama/sdk/build/general";
import { gql, GraphQLClient } from "graphql-request";
import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import customBackfill from "../../helper/customBackfill";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";

const getDailyVolume = () => {
  return gql`
    query volume_per_pool($start: bigint = "") {
      data: pair {
        id
        pairDayData (order_by: {date: desc}, where: {date: {_gte: $start}}) {
          tvol: dailyVolumeUsd
          timestamp: date
        }
      }
    }
  `
}

const graphQLClient = new GraphQLClient("https://api.vortex.network/v1/graphql");
const getGQLClient = () => {
  return graphQLClient
}

interface IGraphResponse {
  tvol: number;
  timestamp: number;
}
const START_TIME = 1647604761;

const fetch = async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000));
  const response = (await getGQLClient().request(getDailyVolume(), {start: START_TIME}));
  const historicalVolume:IGraphResponse[] = response.data.flatMap((e:any) => e.pairDayData);

  const totalVolume = historicalVolume
    .filter(volItem => volItem.timestamp <= dayTimestamp)
    .reduce((acc, { tvol }) => acc + Number(tvol), 0);

  const dailyVolume = historicalVolume
    .filter(dayItem => dayItem.timestamp === dayTimestamp)
    .reduce((acc, { tvol }) => acc + Number(tvol), 0);

  return {
    totalVolume: `${totalVolume}`,
    dailyVolume: dailyVolume ? `${dailyVolume}` : undefined,
    timestamp: dayTimestamp,
  }
}

const adapter: SimpleVolumeAdapter = {
  volume: {
    [CHAIN.TEZOS]: {
      fetch: fetch,
      start: async () => START_TIME,
      customBackfill: customBackfill(CHAIN.TEZOS as Chain, () => fetch)
    },
  },
};

export default adapter;

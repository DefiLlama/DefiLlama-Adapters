import { Chain } from "@defillama/sdk/build/general";
import { gql, GraphQLClient } from "graphql-request";
import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import customBackfill from "../../helper/customBackfill";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";

const getDailyVolume = () => {
  return gql`query getTradingVolumeHistory($timezone: String!, $timestampTo: Int!, $timestampFrom: Int!) {
    getTradingVolumeHistory(timezone: $timezone, timestampTo: $timestampTo, timestampFrom: $timestampFrom) {
      volumes {
        date
        vol
      }
  }
}`
}

const graphQLClient = new GraphQLClient("https://api.cryptocurrencies.ai/graphql");
const getGQLClient = () => {
  return graphQLClient
}

interface IGraphResponse {
  date: string;
  vol: number;
}

const fetch = async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000));
  const val = {timestampFrom: 1643188527, timestampTo: dayTimestamp, timezone: "UTC"};
  const historicalVolume: IGraphResponse[] = (await getGQLClient().request(getDailyVolume(), val))?.getTradingVolumeHistory?.volumes;

  const totalVolume = historicalVolume
  .filter(volItem => (new Date(volItem.date).getTime() / 1000) <= dayTimestamp)
  .reduce((acc, { vol }) => acc + Number(vol), 0)

  const dailyVolume = historicalVolume
    .find(dayItem => (new Date(dayItem.date).getTime() / 1000) === dayTimestamp)?.vol

  return {
    timestamp: dayTimestamp,
    dailyVolume: dailyVolume ? dailyVolume.toString() : undefined,
    totalVolume: totalVolume.toString(),
  }
}

const adapter: SimpleVolumeAdapter = {
  volume: {
    [CHAIN.SOLANA]: {
      fetch: fetch,
      start: async () => 1643188527,
      customBackfill: customBackfill(CHAIN.SOLANA as Chain, () => fetch)
    },
  },
};

export default adapter;

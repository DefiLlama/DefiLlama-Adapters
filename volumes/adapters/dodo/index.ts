import { Adapter, ChainEndpoints, Fetch, IStartTimestamp, SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";
import payload from "./payload";

const { postURL } = require("../../helper/utils");

const endpoints = {
  [CHAIN.ARBITRUM]: "https://gateway.dodoex.io/graphql?opname=FetchDashboardDailyData",
  [CHAIN.AURORA]: "https://gateway.dodoex.io/graphql?opname=FetchDashboardDailyData",
  [CHAIN.BSC]: "https://gateway.dodoex.io/graphql?opname=FetchDashboardDailyData",
  [CHAIN.ETHEREUM]: "https://gateway.dodoex.io/graphql?opname=FetchDashboardDailyData",
  [CHAIN.POLYGON]: "https://gateway.dodoex.io/graphql?opname=FetchDashboardDailyData",
  // [MOONRIVER]: "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-moonriver",
  // [AVAX]: "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-avax",
  // [BOBA]: "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-boba"
  // [HECO]: "https://n10.hg.network/subgraphs/name/dodoex-mine-v3-heco/heco",
  // [OKEXCHAIN]: "https://graph.kkt.one/subgraphs/name/dodoex/dodoex-v2-okchain",
} as ChainEndpoints

const getFetch = (chain: string): Fetch => async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
  const response = await postURL(endpoints[chain], payload(chain))
  return {
    timestamp: dayTimestamp,
    dailyVolume: response.data.data.dashboard_chain_day_data.list.find((item: any) => item.timestamp === dayTimestamp).volume[chain]
  }
}

interface IQueryResponse {
  data: {
    dashboard_chain_day_data: {
      list: Array<{
        timestamp: number,
        volume: {
          [chain: string]: string
        }
      }>
    }
  }
}

const getStartTimestamp = (chain: string): IStartTimestamp => async () => {
  const response = (await postURL(endpoints[chain], payload(chain))).data as IQueryResponse
  const firstDay = response.data.dashboard_chain_day_data.list.find((item: any) => item.volume[chain] !== '0')
  console.log(firstDay);
  return firstDay?.timestamp ?? 0
}

const volume = Object.keys(endpoints).reduce(
  (acc, chain) => ({
    ...acc,
    [chain]: {
      fetch: getFetch(chain),
      start: getStartTimestamp(chain)
    },
  }),
  {}
);

const adapter: SimpleVolumeAdapter = {
  volume
};
export default adapter;

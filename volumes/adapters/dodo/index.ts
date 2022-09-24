import { Adapter, ChainEndpoints, Fetch, IStartTimestamp, SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";
import dailyVolumePayload from "./dailyVolumePayload";
import totalVolumePayload from "./totalVolumePayload";

const { postURL } = require("../../helper/utils");

/* const endpoints = {
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
} as ChainEndpoints */
const dailyEndpoint = "https://gateway.dodoex.io/graphql?opname=FetchDashboardDailyData"
const totalEndpoint = "https://gateway.dodoex.io/graphql?opname=FetchDashboardInfoData"
const chains = [CHAIN.ARBITRUM, CHAIN.AURORA, CHAIN.BSC, CHAIN.ETHEREUM, CHAIN.POLYGON]

interface IDailyResponse {
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

interface ITotalResponse {
  data: {
    dashboard_pairs_count_data: {
      totalVolume: string
    }
  }
}

const getFetch = (chain: string): Fetch => async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
  const dailyResponse = (await postURL(dailyEndpoint, dailyVolumePayload(chain))).data as IDailyResponse
  // const totalResponse = (await postURL(totalEndpoint, totalVolumePayload(chain))).data as ITotalResponse
  return {
    timestamp: dayTimestamp,
    dailyVolume: dailyResponse.data.dashboard_chain_day_data.list.find((item: any) => item.timestamp === dayTimestamp)?.volume[chain],
    // totalVolume: totalResponse.data.dashboard_pairs_count_data.totalVolume
  }
}

const getStartTimestamp = (chain: string): IStartTimestamp => async () => {
  const response = (await postURL(dailyEndpoint, dailyVolumePayload(chain))).data as IDailyResponse
  const firstDay = response.data.dashboard_chain_day_data.list.find((item: any) => item.volume[chain] !== '0')
  return firstDay?.timestamp ?? 0
}

const volume = chains.reduce(
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

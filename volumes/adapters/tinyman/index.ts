import fetchURL from "../../utils/fetchURL"
import type { SimpleVolumeAdapter } from "../../dexVolume.type";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";

const URL = "https://mainnet.analytics.tinyman.org/api/v1/general-statistics/"

interface IAPIResponse {
  total_liquidity_in_usd: string;
  last_day_total_volume_in_usd: string;
  last_day_algo_price_change: string;
};

const fetch = async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
  const response: IAPIResponse = (await fetchURL(URL)).data;
  return {
    dailyVolume: `${response.last_day_total_volume_in_usd}`,
    timestamp: dayTimestamp,
  };
};

const adapter: SimpleVolumeAdapter = {
  volume: {
    algorand: {
      fetch,
      runAtCurrTime: true,
      customBackfill: undefined,
      start: async () => 0,
    },
  }
};

export default adapter;

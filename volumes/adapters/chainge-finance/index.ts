import fetchURL from "../../utils/fetchURL"
import type { SimpleVolumeAdapter } from "../../dexVolume.type";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";
import { CHAIN } from "../../helper/chains";

const URL = "https://info.chainge.finance/api/v1/info/getTotalValue"

interface IAPIResponse {
  totalVolume: number;
};

const fetch = async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
  const response: IAPIResponse = (await fetchURL(URL)).data.data.Total;
  return {
    dailyVolume: `${response.totalVolume}`,
    timestamp: dayTimestamp,
  };
};

const adapter: SimpleVolumeAdapter = {
  volume: {
    [CHAIN.FUSION]: {
      fetch,
      runAtCurrTime: true,
      customBackfill: undefined,
      start: async () => 0,
    },
  }
};

export default adapter;

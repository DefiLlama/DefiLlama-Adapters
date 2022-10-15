import { SimpleVolumeAdapter } from "../../dexVolume.type";

import fetchURL from "../../utils/fetchURL"

const endpoints: { [chain: string]: string } = {
  bsc: "https://api.ellipsis.finance/api/getVolume",
};

interface IAPIResponse {
  success: boolean
  data: {
    total: string,
    day: string,
    generatedTimeMs: number
  }
}

const fetch = (chain: string) => async () => {
  const response: IAPIResponse = (await fetchURL(endpoints[chain])).data;
  return {
    dailyVolume: `${response.data.day}`,
    totalVolume: `${response.data.total}`,
    timestamp: Math.trunc(response.data.generatedTimeMs / 1000),
  };
};

const adapter: SimpleVolumeAdapter = {
  volume: Object.keys(endpoints).reduce((acc, chain) => {
    return {
      ...acc,
      [chain]: {
        fetch: fetch(chain),
        start: async () => 0,
        runAtCurrTime: true
      }
    }
  }, {}) as SimpleVolumeAdapter['volume']
};
export default adapter;

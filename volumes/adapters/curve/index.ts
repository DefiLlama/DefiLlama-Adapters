import { SimpleVolumeAdapter } from "../../dexVolume.type";

import fetchURL from "../../utils/fetchURL"

const endpoints: { [chain: string]: string } = {
  ethereum: "https://api.curve.fi/api/getAllPoolsVolume/ethereum",
  polygon: "https://api.curve.fi/api/getAllPoolsVolume/polygon",
  fantom: "https://api.curve.fi/api/getAllPoolsVolume/fantom",
  arbitrum: "https://api.curve.fi/api/getAllPoolsVolume/arbitrum",
  avalanche: "https://api.curve.fi/api/getAllPoolsVolume/avalanche",
  optimism: "https://api.curve.fi/api/getAllPoolsVolume/optimism",
  xdai: "https://api.curve.fi/api/getAllPoolsVolume/xdai"
};

interface IAPIResponse {
  success: boolean
  data: {
    totalVolume: number,
    cryptoShare: number,
    generatedTimeMs: number
  }
}

const fetch = (chain: string) => async () => {
  const response: IAPIResponse = (await fetchURL(endpoints[chain])).data;
  return {
    dailyVolume: `${response.data.totalVolume}`,
    timestamp: response.data.generatedTimeMs / 1000,
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

import { DexVolumeAdapter } from "../../dexVolume.type";

const { fetchURL } = require("../helper/utils");

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

const adapter: DexVolumeAdapter = {
  volume: Object.keys(endpoints).reduce((acc, chain) => {
    return {
      ...acc,
      [chain]: {
        fetch: fetch(chain),
        start: async () => 0,
        runAtCurrTime: true
      }
    }
  }, {}) as DexVolumeAdapter['volume']
};
export default adapter;

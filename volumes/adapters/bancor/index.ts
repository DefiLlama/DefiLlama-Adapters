import { FetchResult, ChainBlocks, BreakdownVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";

import fetchURL from "../../utils/fetchURL"
const {
  getUniqStartOfTodayTimestamp,
} = require("../../helper/getUniSubgraphVolume");

interface BancorV2Response {
  data: Array<{
    timestamp: number
    bnt: string
    usd: string
    eur: string
    eth: string
  }>
}

interface BancorV3Response {
  bnt: string;
  usd: string;
  eur: string;
  eth: string;
}
const v3Url = "https://api-v3.bancor.network/stats";

const endpoints = {
  ethereum: (date: number) =>
    `https://api-v2.bancor.network/history/volume?interval=day&start_date=${date}`,
};

const fetchV3 = async (timestamp: number): Promise<FetchResult> => {
  const res: BancorV3Response = (await fetchURL(v3Url)).data.data.totalVolume24h;
  return {
    timestamp,
    dailyVolume: res.usd
  }
}

const graphs = (chain: string) =>
  async (timestamp: number, _chainBlocks: ChainBlocks): Promise<FetchResult> => {
    const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
    switch (chain) {
      case "ethereum":
        return fetchURL(endpoints.ethereum(dayTimestamp)).then((res: any) => res.data)
          .then(({ data }: BancorV2Response) => {
            const volume = data.find(item => (item.timestamp / 1000) === dayTimestamp)
            if (!volume) throw new Error(`Unexpected error: No volume found for ${dayTimestamp}`)
            return {
              timestamp: dayTimestamp,
              dailyVolume: volume.usd
            }
          })
      default:
        throw new Error(`No adapter found for ${chain}`)
    }
  }



const adapter: BreakdownVolumeAdapter = {
  breakdown: {
    "v2.1": {
      [CHAIN.ETHEREUM]: {
        fetch: graphs("ethereum"),
        runAtCurrTime: false,
        customBackfill: undefined,
        start: async () => 1570665600,
      }
    },
    "v3": {
      [CHAIN.ETHEREUM]: {
        fetch: fetchV3,
        runAtCurrTime: true,
        start: async () => 0,
      }
    }
  }
}
export default adapter;

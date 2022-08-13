import { DexVolumeAdapter, FetchResult } from "../dexVolume.type";
import { getTimestampAtStartOfHour } from "../helper/getTimestampAtStartOfHour";

const BigNumber = require("bignumber.js");
const { fetchURL } = require("../helper/utils");
const {
  getUniqStartOfTodayTimestamp,
} = require("../helper/getUniSubgraphVolume");

interface BancorV2Response {
  data: Array<{
    timestamp: number
    bnt: string
    usd: string
    eur: string
    eth: string
  }>
}
const endpoints = {
  ethereum: (date: number) =>
    `https://api-v2.bancor.network/history/volume?interval=day&start_date=${date}`,
};

const graphs = (chain: string) =>
  async (timestamp: number, _chainBlocks: ChainBlocks): Promise<FetchResult> => {
    const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
    switch (chain) {
      case "ethereum":
        return fetchURL(endpoints.ethereum(dayTimestamp)).then((res: any) => res.data)
          .then(({ data }: BancorV2Response) => {
            const volume = data.find(item => (item.timestamp / 1000) === dayTimestamp)
            if (!volume) throw new Error("Unexpected error: No volume found")
            return {
              timestamp: dayTimestamp,
              dailyVolume: volume.usd
            }
          })
      default:
        throw new Error(`No adapter found for ${chain}`)
    }
  }

const adapter: DexVolumeAdapter = {
  volume: {
    ethereum: {
      fetch: graphs("ethereum"),
      runAtCurrTime: true,
      customBackfill: undefined,
      start: 0,
    },
    // CUSTOM BACKFILL
  },
};

export default adapter;

import axios from "axios";
import type { IStartTimestamp, SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";

const chains = [CHAIN.ETHEREUM, CHAIN.AVAX, CHAIN.BSC, CHAIN.ARBITRUM, CHAIN.OPTIMISM, CHAIN.POLYGON]

const dateToTs = (date: string) => new Date(date).getTime() / 1000
const normalizeChain = (c: string) => c === "Avalanche" ? "avax" : c.toLowerCase()

interface IAPIResponse {
  data: {
    rows: [string, string, number][] //[chain, dateString, volume]
  }
}

const getStartTime = async (chain: string) => {
  const response = (await axios.get("https://hashflow2.metabaseapp.com/api/public/dashboard/f4b12fd4-d28c-4f08-95b9-78b00b83cf17/dashcard/104/card/97?parameters=%5B%5D")).data as IAPIResponse
  const startTime = response.data.rows.filter(([c]) => normalizeChain(c) === chain).reduce((acc, [_chain, dateString]) => {
    const potentialStartTimestamp = dateToTs(dateString)
    if (potentialStartTimestamp < acc) return potentialStartTimestamp
    else return acc
  }, Number.POSITIVE_INFINITY)
  return startTime
}

const adapter: SimpleVolumeAdapter = {
  volume: chains.reduce((acc, chain) => {
    return {
      ...acc,
      [chain]: {
        fetch: async (timestamp) => {
          const cleanTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
          const response = (await axios.get("https://hashflow2.metabaseapp.com/api/public/dashboard/f4b12fd4-d28c-4f08-95b9-78b00b83cf17/dashcard/104/card/97?parameters=%5B%5D")).data as IAPIResponse
          const vol = response.data.rows.filter(([c]) => normalizeChain(c) === chain).find(([_chain, dateString]) => dateToTs(dateString) === cleanTimestamp)
          return {
            timestamp: cleanTimestamp,
            dailyVolume: vol ? vol[2].toString() : undefined
          }
        },
        start: async () => getStartTime(chain),
      }
    }
  }, {} as SimpleVolumeAdapter['volume'])
};

export default adapter;
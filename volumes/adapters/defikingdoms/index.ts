import axios from "axios";
import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";

const API = "https://nomics.com/data/exchange-volume-history?convert=USD&exchange=defikingdoms&interval=all"

interface IAPIResponse {
  items: Array<{
    timestamp: string
    volume: string
    spot_volume: string
    derivative_volume: string
  }>
}

const adapter: SimpleVolumeAdapter = {
  volume: {
    [CHAIN.HARMONY]: {
      start: async () => {
        const data = (await axios.get(API)).data as IAPIResponse
        return new Date(data.items[0].timestamp).getTime() / 1000
      },
      fetch: async (timestamp: number) => {
        const data = (await axios.get(API)).data as IAPIResponse
        const cleanTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
        return {
          timestamp: cleanTimestamp,
          dailyVolume: data.items.find((item) => (new Date(item.timestamp).getTime() / 1000) === cleanTimestamp)?.spot_volume,
          totalVolume: String(data.items.reduce((acc, item)=>acc+=+item.spot_volume, 0))
        }
      }
    },
  },
};

export default adapter;

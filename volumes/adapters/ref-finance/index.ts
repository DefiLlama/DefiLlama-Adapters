import axios from "axios";
import type { SimpleVolumeAdapter } from "../../dexVolume.type";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";

const dateToTs = (date: string) => new Date(date).getTime() / 1000

const api = "https://api.stats.ref.finance/api/volume24h?period=730"

const adapter: SimpleVolumeAdapter = {
  volume: {
    "near":{
      start: async()=>{
        const data = await axios.get(api)
        return dateToTs(data.data[0].date)
      },
      fetch: async(ts)=>{
        const data = await axios.get(api)
        const cleanTimestamp = getUniqStartOfTodayTimestamp(new Date(ts * 1000))
        return {
          timestamp: cleanTimestamp,
          dailyVolume: data.data.find((t:any)=>dateToTs(t.date) === cleanTimestamp)?.volume
        }
      }
    }
  }
};

export default adapter;
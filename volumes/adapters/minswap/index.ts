import axios from "axios";
import type { SimpleVolumeAdapter } from "../../dexVolume.type";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";

const getVol = async()=>axios.post("https://monorepo-mainnet-prod.minswap.org/graphql?VolumeSeries", {"query":"\n    query VolumeSeries {\n  volumeSeries {\n    time\n    volume\n  }\n}\n    ","variables":{}})
  .then(data=>data.data.data.volumeSeries)

const adapter: SimpleVolumeAdapter = {
  volume: {
    "cardano": {
      start: async () => {
        return getVol().then(data=>data[0].time/1e3)
      },
      fetch: async (ts) => {
        const cleanTimestamp = getUniqStartOfTodayTimestamp(new Date(ts * 1000))
        const vols = await getVol()
        const vol = vols.find((v:any)=>v.time/1e3===cleanTimestamp)
        const prices = await axios.post('https://coins.llama.fi/prices', {
          "coins": [
            "coingecko:cardano",
          ],
          timestamp: cleanTimestamp
        })
        return {
          timestamp: cleanTimestamp,
          dailyVolume: String(vol.volume/1e6 * prices.data.coins["coingecko:cardano"].price)
        }
      }
    }
  }
};

export default adapter;
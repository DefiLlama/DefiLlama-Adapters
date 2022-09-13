import axios from "axios";
import type { SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";

const chains = [CHAIN.ETHEREUM, CHAIN.AVAX, CHAIN.BSC, CHAIN.ARBITRUM, CHAIN.OPTIMISM, CHAIN.POLYGON]

const dateToTs = (date:string) => new Date(date).getTime()/1000
const diffTime = (d1:string, d2:number) => Math.abs(dateToTs(d1) - d2)
const normalizeChain = (c:string)=> c === "Avalanche" ? "avax":c.toLowerCase()

const adapter: SimpleVolumeAdapter = {
    volume: chains.reduce((acc, chain) => {
      return {
        ...acc,
        [chain]: {
          fetch: async (timestamp) =>{
            const data = await axios.get("https://hashflow2.metabaseapp.com/api/public/dashboard/f4b12fd4-d28c-4f08-95b9-78b00b83cf17/dashcard/104/card/97?parameters=%5B%5D")
            const vol = (data.data.data.rows as [string, string, number][]).filter((t)=>normalizeChain(t[0]) === chain).reduce((curr, best)=>{
                if(diffTime(best[1], timestamp) < diffTime(curr[1], timestamp)){
                    return best
                } else {
                    return curr
                }
            })
            if(diffTime(vol[1], timestamp) > (24*3600)){
                throw new Error("Best timestamp is too distant")
            }
            return {
                timestamp: dateToTs(vol[1]),
                dailyVolume: String(vol[2]),
            }
          },
          start: async () => 0,
        }
      }
    }, {} as SimpleVolumeAdapter['volume'])
  };
  
  export default adapter;
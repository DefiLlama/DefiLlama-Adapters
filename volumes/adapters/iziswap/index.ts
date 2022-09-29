import axios from "axios";
import { FetchResult, SimpleVolumeAdapter } from "../../dexVolume.type";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";
import { CHAIN } from "../../helper/chains";

const endpoints = "https://izumi.finance/api/v1/izi_swap/summary_record/"

const chainIdList = {
  [CHAIN.BSC]: {
    chainId: 56,
    startTimeStamp: 1651766400,
  },
  [CHAIN.AURORA]: {
    chainId: 1313161554,
    startTimeStamp: 1659715200,
  },
}

const graphs = (chainId: number) =>
  async (timestamp: number, _chainBlocks: ChainBlocks): Promise<FetchResult> => {
    const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
    const Timestamp = new Date((dayTimestamp - 86400) * 1000)
    const commonTime = Timestamp.toISOString().slice(0, 19).replace('T', ' ')
        const params = {
          chain_id: chainId,
          type: 4,
          order_by: '-time',
          time_start: commonTime,
        }
        return axios.get(endpoints, {params}).then((r)=>{
          const tvl = r.data.data[0].tvl
          const volDay = r.data.data[0].volDay
          return {
            timestamp: dayTimestamp,
            dailyVolume: volDay,
            totalVolume: tvl
          }
        })
  }

const adapter: SimpleVolumeAdapter = {
  volume: Object.keys(chainIdList).reduce((acc, chain)=>{
    return {
      ...acc,
      [chain]:{
        fetch: graphs((chainIdList as any)[chain]['chainId']),
        start: async () => (chainIdList as any)[chain]['startTimeStamp'],
      }
    }
  }, {} as SimpleVolumeAdapter['volume'])
}

export default adapter;
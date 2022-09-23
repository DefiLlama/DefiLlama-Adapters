import request, { gql } from "graphql-request";
import { Fetch, SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";

const endpoints: { [key: string]: string } = {
  [CHAIN.ARBITRUM]: "https://api.thegraph.com/subgraphs/name/gmx-io/gmx-stats",
  [CHAIN.AVAX]: "https://api.thegraph.com/subgraphs/name/gmx-io/gmx-avalanche-stats",
}

const historicalData = gql`
  query get_volume($period: String!, $id: String!) {
    volumeStats(where: {period: $period, id: $id}) {
        swap
      }
  }
`

interface IGraphResponse {
  volumeStats: Array<{
    burn: string,
    liquidation: string,
    margin: string,
    mint: string,
    swap: string,
  }>
}

const getFetch = (chain: string): Fetch => async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date((timestamp * 1000)))
  const dailyData: IGraphResponse = await request(endpoints[chain], historicalData, {
    id: chain === CHAIN.ARBITRUM
      ? String(dayTimestamp)
      : String(dayTimestamp) + ':daily',
    period: 'daily',
  })
  const totalData: IGraphResponse = await request(endpoints[chain], historicalData, {
    id: 'total',
    period: 'total',
  })

  return {
    timestamp: dayTimestamp,
    dailyVolume:
      dailyData.volumeStats.length == 1
        ? String(Number(Object.values(dailyData.volumeStats[0]).reduce((sum, element) => String(Number(sum) + Number(element)))) * 10 ** -30)
        : undefined,
    totalVolume:
      totalData.volumeStats.length == 1
        ? String(Number(Object.values(totalData.volumeStats[0]).reduce((sum, element) => String(Number(sum) + Number(element)))) * 10 ** -30)
        : undefined,

  }
}

const getStartTimestamp = async (chain: string) => {
  const startTimestamps: { [chain: string]: number } = {
    [CHAIN.ARBITRUM]: 1630368000,
    [CHAIN.AVAX]: 1640131200,
  }
  return startTimestamps[chain]
}

const adapter: SimpleVolumeAdapter = {
  volume: Object.keys(endpoints).reduce((acc, chain) => {
    return {
      ...acc,
      [chain]: {
        fetch: getFetch(chain),
        start: async () => getStartTimestamp(chain),
        runAtCurrTime: true
      }
    }
  }, {}) as SimpleVolumeAdapter['volume']
}

export default adapter;

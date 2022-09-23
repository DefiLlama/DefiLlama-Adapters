import { gql, GraphQLClient } from "graphql-request";
import { BreakdownVolumeAdapter, Fetch, SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";

const chains = [CHAIN.ETHEREUM, CHAIN.POLYGON]

const DAY_IN_SECONDS = 60 * 60 * 24
const formatTimestamp = (timestamp: number) => {
  const d = new Date(timestamp * 1000);
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}T${d.getUTCHours()}:${d.getUTCMinutes()}:${d.getUTCSeconds()}+00:00`
}

// https://preview.info.0x.org/liquiditySources/0x%20RFQ?_data=routes%2FliquiditySources%2F%24liquiditySourceName

const getHistoricalDataQuery = (timestamp: number) => {
  const gteDate = formatTimestamp(timestamp - DAY_IN_SECONDS)
  const ltDate = formatTimestamp(timestamp)
  return gql`
  query DailyFills {
    fills(
      where: {isRfq: {_eq: true}, timestamp: {_gte: "${gteDate}", _lt: "${ltDate}"}}
    ) {
      volumeUSD
      isRfq
      timestamp
      liquiditySource
      chainName
    }
  }
`
}

const graphQLClient = new GraphQLClient("https://api.0x.org/data/v0");
const getGQLClient = () => {
  graphQLClient.setHeader("0x-api-key", process.env.ZEROx_API_KEY ?? '')
  return graphQLClient
}

interface IGraphResponse {
  fills: Array<{
    volumeUSD: number,
    isRfq: boolean,
    timestamp: string,
    liquiditySource: string | null,
    chainName: string
  }>
}

const getFetch = (chain: string): Fetch => async (timestamp: number) => {
  const formattedChain = chain[0].toUpperCase() + chain.slice(1).toLowerCase()
  const dailyDataResponse: IGraphResponse = await getGQLClient().request(getHistoricalDataQuery(timestamp))
  const dailyVolume = dailyDataResponse.fills.reduce((acc, curr) => formattedChain === curr.chainName ? acc += curr.volumeUSD : acc, 0)
  return {
    timestamp: timestamp - DAY_IN_SECONDS,
    dailyVolume: String(dailyVolume)
  }
}

const adapter: BreakdownVolumeAdapter = {
  breakdown: {
    "0x RFQ": {
      ...chains.reduce((acc, chain) => {
        return {
          ...acc,
          [chain]: {
            fetch: getFetch(chain),
            start: async () => 0
          }
        }
      }, {}) as SimpleVolumeAdapter['volume']
    }
  }
}

export default adapter;

import { FetchResult, SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import { gql, request } from "graphql-request";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";


interface IGraph {
    dayTradeVolumeUSD: string;
    dayID: string;
}

const URL = 'https://api.thegraph.com/subgraphs/name/platypus-finance/platypus-dashboard';
const fetch = async (timestamp: number): Promise<FetchResult> => {
    const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000));
    const dayID = (dayTimestamp / 86400);
    const query = gql`
    {
        exchangeDayData(id: "${dayID}") {
            dayID
            dayTradeVolumeUSD
        }
    }
    `
    const response: IGraph = (await request(URL, query)).exchangeDayData;
    const dailyVolume = Number(response.dayTradeVolumeUSD) / 2;

    return {
        dailyVolume: dailyVolume ? `${dailyVolume}` : undefined,
        timestamp: dayTimestamp,
    };
}

const adapter: SimpleVolumeAdapter = {
    volume: {
        [CHAIN.AVAX]: {
            fetch: fetch,
            start: async () => 1635206400,
        },
    },
};

export default adapter;

import { DexVolumeAdapter } from "../dexVolume.type";
import { getUniqStartOfTodayTimestamp } from "../helper/getUniSubgraphVolume";

const { GraphQLClient, gql } = require("graphql-request");

const endpoint = "https://api.vybenetwork.com/v1/graphql";

const query = gql`
  query QueryVolume {
    api_serum_dex_m {
      globalVolumeStats {
        t
        v
      }
    }
  }
`;

const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    authorization: process.env.PROD_VYBE_API_KEY,
  },
});

interface IGraphResponse {
  api_serum_dex_m: {
    globalVolumeStats: {
      t: number[]
      v: number[]
    }
  }
}

const fetch = async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))

  const data: IGraphResponse = await graphQLClient.request(query);

  const dailyVolumeIndex = data.api_serum_dex_m.globalVolumeStats.t.findIndex(t => t === dayTimestamp);

  return {
    dailyVolume: dailyVolumeIndex ? `${data.api_serum_dex_m.globalVolumeStats.v[dailyVolumeIndex]}` : undefined,
    timestamp: dayTimestamp,
  };
};

const getStartTimestamp = async () => {
  const data = await graphQLClient.request(query);
  return data.api_serum_dex_m.globalVolumeStats.t[0]
}

const adapter: DexVolumeAdapter = {
  volume: {
    solana: {
      fetch,
      start: getStartTimestamp,
    },
  },
};

export default adapter;

// Todo Total volume and backfill

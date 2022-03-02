import { DexVolumeAdapter } from "../dexVolume.type";

const { GraphQLClient, gql } = require("graphql-request");

const endpoint = "https://api.vybenetwork.com/v1/graphql";

const query = gql`
  query MyQuery {
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

const fetch = async () => {
  const data = await graphQLClient.request(query);

  const volumes = data.api_serum_dex_m.globalVolumeStats.v;

  const dailyVolume: string = volumes[volumes.length - 1];

  return {
    totalVolume: "0",
    dailyVolume,
    timestamp: 1,
  };
};

const adapter: DexVolumeAdapter = {
  volume: {
    solana: {
      fetch,
      start: 0,
      runAtCurrTime: true,
      customBackfill: () => {},
    },
  },
};

export default adapter;

// Todo Total volume and backfill

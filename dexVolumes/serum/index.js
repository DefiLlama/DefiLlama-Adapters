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

const solana = async () => {
  const data = await graphQLClient.request(query);
  console.log(data);

  const volumes = data.api_serum_dex_m.globalVolumeStats.v;

  const dailyVolume = volumes[volumes.length - 1];

  return {
    dailyVolume,
  };
};

module.exports = {
  solana,
};

// Todo Total volume and backfill

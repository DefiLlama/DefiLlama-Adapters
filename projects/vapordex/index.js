const { gql, GraphQLClient } = require("graphql-request");

const graphQLClient = new GraphQLClient(
  "https://api.thegraph.com/subgraphs/name/mejiasd3v/vapordex-avalanche"
);

const getGQLClient = () => {
  return graphQLClient;
};

const getLPs = () => {
  return gql`
    query LP {
      liquidityPools {
        totalValueLockedUSD
      }
    }
  `;
};

const tvl = async () => {
  const res = await getGQLClient().request(getLPs());
  const data = res.liquidityPools;
  const flattenedData = data.flatMap((result) => result.totalValueLockedUSD);
  const numRes = [];
  const length = flattenedData.length;
  for (let i = 0; i < length; i++) {
    numRes.push(parseInt(flattenedData[i]));
  }
  const TVL = numRes.reduce((partialSum, a) => partialSum + a, 0);
  return TVL;
};

module.exports = {
  timetravel: false,
  methodology: "gets the data of the pools and sums up the value locked ",
  fetch: tvl,
};

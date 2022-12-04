const axios = require("axios");

const urlConfigs = {
  graphQLUrl: "https://heliswap-prod-362307.oa.r.appspot.com/query",
  tokenListUrl:
    "https://heliswap.infura-ipfs.io/ipfs/QmTkk1Cmvh3D8cQHKf4P8WovwRzSABWrDjo4a8gGxXKUrT",
};

const axiosConfig = {
  url: urlConfigs.graphQLUrl,
  method: "post",
};

const getWhitelistedTokenAddresses = async () => {
  let tokens = [];

  const response = await axios(urlConfigs.tokenListUrl);
  const {
    data: { tokens: whitelistedTokens },
  } = response;

  tokens =
    whitelistedTokens.length > 0
      ? whitelistedTokens.map((token) => token.address)
      : [];

  return tokens;
};

const tvl = async () => {
  let totalTVL = 0;

  const whitelistedAddresses = await getWhitelistedTokenAddresses();

  const { url, method } = axiosConfig;
  const requestData = {
    query: `query getWhitelistedPools($tokens: [String]!) {
                poolsConsistingOf(tokens: $tokens) {
                  tvl
                }
              }`,
    variables: {
      tokens: whitelistedAddresses,
    },
  };

  const requestObject = {
    url,
    method,
    data: requestData,
  };

  const {
    data: { data: { poolsConsistingOf }}
  } = await axios(requestObject);

  totalTVL = poolsConsistingOf.reduce((acc, pool) => (isNaN(+pool.tvl)) ? acc : acc + +pool.tvl, 0)

  return { tether: totalTVL };
};

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  hedera: {
    tvl,
  },
};

const axios = require("axios");

const urlConfigs = {
  graphQLUrl: "https://heliswap-prod-362307.oa.r.appspot.com/query",
  tokenListUrl: "https://heliswap-api.ey.r.appspot.com/tokens/whitelisted/",
};

const axiosConfig = {
  url: urlConfigs.graphQLUrl,
  method: "post",
};

const getWhitelistedTokenAddresses = async () => {
  const response = await axios(urlConfigs.tokenListUrl);
  const { data: whitelistedTokens } = response;

  return whitelistedTokens;
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

  totalTVL = poolsConsistingOf.reduce((acc, pool) => (isNaN(+pool.tvl) || +pool.tvl > 1e8) ? acc : acc + +pool.tvl, 0)

  return { tether: totalTVL };
};

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  hedera: {
    tvl,
  },
};

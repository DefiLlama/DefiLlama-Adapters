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

  const response = await axios(requestObject);

  const {
    data: { data },
  } = response;

  totalTVL =
    data && data.poolsConsistingOf && data.poolsConsistingOf?.length > 0
      ? data.poolsConsistingOf.reduce((acc, pool) => {
          acc = acc + Number(pool.tvl);

          return acc;
        }, 0)
      : 0;

  return { tether: totalTVL };
};

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  hedera: {
    tvl,
  },
};

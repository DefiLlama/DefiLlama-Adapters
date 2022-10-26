const axios = require("axios");

const urlConfigs = {
  graphQLUrl: "https://heliswap-prod-362307.oa.r.appspot.com/query",
  tokenListUrl:
    "https://heliswap.infura-ipfs.io/ipfs/QmPuGdL54tqq4vPx15k7tLh2rzwJTRXBNYi92PJnrr39pY",
};

const axiosConfig = {
  url: urlConfigs.graphQLUrl,
  method: "post",
};

const getWhitelistedTokenAddresses = async () => {
  let tokens = [];

  try {
    const response = await axios(urlConfigs.tokenListUrl);
    const {
      data: { tokens: whitelistedTokens },
    } = response;

    tokens =
      whitelistedTokens.length > 0
        ? whitelistedTokens.map((token) => token.address)
        : [];
  } catch (e) {
    console.error(`[Error on fetching tokens: ${e.message}]`);
  }

  return tokens;
};

const getTVL = async () => {
  let totalTVL = 0;

  try {
    const whitelistedAddresses = await getWhitelistedTokenAddresses();

    const { url, method } = axiosConfig;
    const requestData = {
      query: `query getWhitelistedPools($tokens: [String]!) {
                poolsConsistingOf(tokens: $tokens) {
                  volume24h
                  volume7d
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
            acc = acc + Number(pool.volume24h);

            return acc;
          }, 0)
        : 0;

    return totalTVL;
  } catch (e) {
    console.log(`[Error on fetching tvl: ${e.message}]`);
  }

  return totalTVL;
};

getTVL();

module.exports = {
  hedera: {
    tvl: getTVL,
  },
};

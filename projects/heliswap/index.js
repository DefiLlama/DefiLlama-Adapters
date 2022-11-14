const axios = require("axios");

const urlConfigs = {
  graphQLUrl: "https://heliswap-prod-362307.oa.r.appspot.com/query",
  tokenListUrl:
    "https://heliswap.infura-ipfs.io/ipfs/QmWcPfxiQsi2R6EXQLygLV5XVq36QcP6bmbaHN6ajwLeGv",
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

const hedera = async () => {
  const whitelistedAddresses = await getWhitelistedTokenAddresses();

  const { url, method } = axiosConfig;
  const requestData = {
    query: `query getWhitelistedPools($tokens: [String]!) {
                poolsConsistingOf(tokens: $tokens) {
                  tvl
                  volume24hUsd
                  volume7dUsd
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

  const initialAccValue = {
    tvl: {
      tether: 0,
    },
    volume24H: {
      tether: 0,
    },
    volume7D: {
      tether: 0,
    },
  };

  const returnObject =
    data && data.poolsConsistingOf && data.poolsConsistingOf?.length > 0
      ? data.poolsConsistingOf.reduce((acc, pool) => {
          const updatedAcc = {
            tvl: {
              tether: acc.tvl.tether + Number(pool.tvl),
            },
            volume24H: {
              tether: acc.volume24H.tether + Number(pool.volume24hUsd),
            },
            volume7D: {
              tether: acc.volume7D.tether + Number(pool.volume7dUsd),
            },
          };

          return updatedAcc;
        }, initialAccValue)
      : initialAccValue;

  return returnObject;
};

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  hedera,
};

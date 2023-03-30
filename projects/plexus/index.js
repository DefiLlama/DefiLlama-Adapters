const axios = require("axios");

const CHAIN = {
  1: "ethereum",
  56: "binance",
  137: "polygon",
  250: "fantom",
};

const getFee = async (chainId, formattedDate) => {
  const { data } = await axios.get(
    `https://api.plexus.app/v1/dashboard/fee?date=${formattedDate}`
  );
  return data.data[chainId];
};

const timeStampToDate = (timestamp) => {
  const date = new Date(timestamp);

  const year = date.getUTCFullYear();
  const month = ("0" + (date.getUTCMonth() + 1)).slice(-2);
  const day = ("0" + date.getUTCDate()).slice(-2);

  return `${year}-${month}-${day}`;
};

module.exports = Object.entries(CHAIN).reduce(
  (result, [chainId, chainName]) => {
    result[chainName] = {
      fetch: async (timestamp) => {
        const formattedDate = timeStampToDate(timestamp);

        return await getFee(chainId, formattedDate);
      },
    };
    return result;
  },
  {}
);

const { fetchURL } = require("../helper/utils");

const endpoints = {
  ethereum: "https://api.curve.fi/api/getAllPoolsVolume/ethereum",
};

const graphs = (chain) => async () => {
  let res;
  switch (chain) {
    case "ethereum":
      res = await fetchURL(endpoints.ethereum);
    default:
      res = await fetchURL(endpoints.ethereum);
  }

  return {
    dailyVolume: res?.data?.data?.totalVolume,
  };
};

module.exports = {
  ethereum: graphs("ethereum"),
};

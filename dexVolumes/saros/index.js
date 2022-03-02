const { fetchURL } = require("../helper/utils");

const endpoints = {
  solana: "https://api.saros.finance/info",
};

const graphs = (chain) => async () => {
  let res;
  switch (chain) {
    case "solana":
      res = await fetchURL(endpoints.solana);
    default:
      res = await fetchURL(endpoints.solana);
  }

  return {
    tvl: res?.data?.tvl,
    dailyVolume: res?.data?.volume24h,
    volume24h: res?.data?.volume24h,
    totalVolume: res?.data?.totalvolume,
  };
};

module.exports = {
  volume: {
    solana: graphs("solana"),
  },
};
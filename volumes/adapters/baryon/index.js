const { fetchURL } = require("../../helper/utils");
const { BSC } = require("../../helper/chains");

const endpoints = {
  [BSC]: "https://api.baryon.network/program/info",
};

const graphs = async () => {
  let res = await fetchURL(endpoints[BSC]);

  return {
    tvl: res?.data?.tvl,
    dailyVolume: res?.data?.volume24h,
    volume24h: res?.data?.volume24h,
    totalVolume: res?.data?.totalvolume,
  };
};

module.exports = {
  volume: {
    [BSC]: graphs,
  },
};
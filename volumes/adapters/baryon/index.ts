import { Fetch, VolumeAdapter } from "../../dexVolume.type";

import fetchURL from "../../utils/fetchURL"
const { BSC } = require("../../helper/chains");

const endpoints = {
  [BSC]: "https://api.baryon.network/program/info",
};

const graphs: Fetch = async (_timestamp: number) => {
  let res = await fetchURL(endpoints[BSC]);

  return {
    timestamp: Math.trunc(Date.now() / 1000),
    dailyVolume: res?.data?.volume24h,
    totalVolume: res?.data?.totalvolume,
  };
};

export default {
  volume: {
    [BSC]: {
      fetch: graphs,
      runAtCurrTime: true
    },
  },
} as VolumeAdapter;
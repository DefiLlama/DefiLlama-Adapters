import { DexVolumeAdapter } from "../dexVolume.type";

const { fetchURL } = require("../helper/utils");

const endpoints = {
  solana: "https://api.saros.finance/info",
};

const graphs = (chain: string) => async () => {
  let res;
  switch (chain) {
    case "solana":
      res = await fetchURL(endpoints.solana);
    default:
      res = await fetchURL(endpoints.solana);
  }

  return {
    timestamp: 1, // fix
    dailyVolume: res.data.volume24h,
    totalVolume: res.data.totalvolume,
  };
};

// @TODO check and backfill
const adapter: DexVolumeAdapter = {
  volume: {
    solana: {
      fetch: graphs("solana"),
      runAtCurrTime: true,
      customBackfill: () => {},
      start: 0,
    },
  },
};
export default adapter;

import { DexVolumeAdapter } from "../dexVolume.type";
import { IGraphs } from "../helper/customBackfill";

const { fetchURL } = require("../helper/utils");

const endpoints = {
  ethereum: "https://api.curve.fi/api/getAllPoolsVolume/ethereum",
};

// type better later
const graphs: IGraphs = (chain: any) => async () => {
  const timestamp = Date.now() / 1000;
  let res;
  switch (chain) {
    case "ethereum":
      res = await fetchURL(endpoints.ethereum);
    default:
      res = await fetchURL(endpoints.ethereum);
  }

  return {
    totalVolume: res?.data?.data?.totalVolume,
    timestamp,
  };
};

const adapter: DexVolumeAdapter = {
  volume: {
    ethereum: {
      fetch: graphs("ethereum"),
      runAtCurrTime: true,
      customBackfill: undefined,
      start: async () => 0,
    },
    // TODO custom backfill
  },
};
export default adapter;

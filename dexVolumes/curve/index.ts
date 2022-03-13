import { DexVolumeAdapter } from "../dexVolume.type";
import { getTimestampAtStartOfHour } from "../helper/getTimestampAtStartOfHour";

const { fetchURL } = require("../helper/utils");

const endpoints = {
  ethereum: "https://api.curve.fi/api/getAllPoolsVolume/ethereum",
};

// type better later
const graphs = (chain: any) => async () => {
  const timestamp = getTimestampAtStartOfHour();
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
      customBackfill: () => {},
      start: 0,
    },
    // TODO custom backfill
  },
};
export default adapter;

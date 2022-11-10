import { SimpleVolumeAdapter } from "../../dexVolume.type";

import fetchURL from "../../utils/fetchURL"

const gfx_volume_endpoint = "https://nest-api.goosefx.io/stats/volume"


const graphs = async () => {
  let res = await fetchURL(gfx_volume_endpoint);
  return {
    dailyVolume: res?.data?.volume24hr,
    timestamp: Math.trunc(Date.now() / 1000)
  };
};

const adapter: SimpleVolumeAdapter = {
  volume: {
    solana: {
      fetch: graphs,
      runAtCurrTime: true,
      //customBackfill: undefined,
      start: async () => 0,
    },
    // TODO custom backfill
  },
};

export default adapter;

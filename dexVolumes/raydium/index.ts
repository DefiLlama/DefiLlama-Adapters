import { DexVolumeAdapter } from "../dexVolume.type";

const { fetchURL } = require("../helper/utils");

const endpoints = {
  solana: "https://api.raydium.io/info",
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
    totalVolume: res?.data?.totalvolume,
    timestamp: 1, // fix
  };
};

const adapter: DexVolumeAdapter = {
  volume: {
    solana: {
      fetch: graphs("solana"),
      runAtCurrTime: true,
      customBackfill: () => {},
      start: 0,
    },
    // TODO custom backfill
  },
};

export default adapter;

/*
    backfill steps

    1. https://api.raydium.io/pairs
    call all pairs

    2. for each pair use amm_id

    3. query rayqlbeta2.aleph.cloud for each pair and sum for respective dates

    {
    pool_hourly_data(address: "GaqgfieVmnmY4ZsZHHA6L5RSVzCGL3sKx4UgHBaYNy8m", skip: 10) {
        volume_usd
        time
    }
    }
*/

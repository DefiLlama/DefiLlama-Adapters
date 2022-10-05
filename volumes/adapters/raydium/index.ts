import { SimpleVolumeAdapter } from "../../dexVolume.type";

import fetchURL from "../../utils/fetchURL"

const endpoints = {
  solana: "https://api.raydium.io/v2/main/info",
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
    dailyVolume: res?.data?.volume24h,
    timestamp: Math.trunc(Date.now() / 1000)
  };
};

const adapter: SimpleVolumeAdapter = {
  volume: {
    solana: {
      fetch: graphs("solana"),
      runAtCurrTime: true,
      customBackfill: undefined,
      start: async () => 0,
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

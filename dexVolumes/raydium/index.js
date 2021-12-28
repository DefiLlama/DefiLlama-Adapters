const { fetchURL } = require("../helper/utils");

const endpoints = {
  solana: "https://api.raydium.io/info",
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
    totalVolume: res?.data?.totalvolume,
  };
};

module.exports = {
  solana: graphs("solana"),
};

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

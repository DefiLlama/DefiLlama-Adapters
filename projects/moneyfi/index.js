const axios = require("axios");

async function fetchTVL() {
  const { data } = await axios.get(
    "https://api.moneyfi.fund/tvl-defillama"
  );
  return data;
}

function chainTVL(chain) {
  return async () => {
    const { chains } = await fetchTVL();
    return {
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": chains[chain] * 10**6
    };
  };
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL is fetched directly from the project's backend and represents token balances on each chain",

  arbitrum: { tvl: chainTVL("arbitrum") },
  base:      { tvl: chainTVL("base") },
  bsc:       { tvl: chainTVL("bsc") },
  ethereum:  { tvl: chainTVL("mainnet") },
  soneium:   { tvl: chainTVL("soneium") },
};

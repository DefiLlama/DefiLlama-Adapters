const { fetchURL } = require("../helper/utils");
const { toUSDTBalances } = require("../helper/balances");

function chainTvl(ChainName, mapFunction) {
  return async () => {
    const response = await fetchURL("https://api.paprprintr.finance/api");
    const data = Number(
      response.data.networks
        .filter((chain) => chain.name.includes(ChainName))
        .map(mapFunction)
    );

    return toUSDTBalances(data);
  };
}

function chainExports(chain) {
  return {
    tvl: chainTvl(chain, (tvl) => tvl.stats.vaults),
    staking: chainTvl(chain, (stake) => stake.stats.boardroom.tvl),
    pool2: chainTvl(chain, (pool) => pool.stats.pools),
  };
}

module.exports = {
  timetravel: false,
  kcc: chainExports("KCC"),
  fantom: chainExports("Fantom"),
  bsc: chainExports("BSC"),
  polygon: chainExports("Polygon"),
  aurora: chainExports("Aurora"),
  okexchain: chainExports("OKExChain"),
  methodology:
    "Counts the liquidity on all the Vaults; and the portion locked on the Pools and Broadrooms as pool2 and staking respectivly",
};

const { get } = require("../helper/http");

const endpoint = "https://api.soc.trading/web-service/soc/vault/v1/getSocAccountBalance";

async function getTvl() {
  const { api } = arguments[3];
  const { network } = config[api.chain];

  const tvl = await get(endpoint, { network: [network] });
  //const tvl = results.stats.totalValueManaged;

  return { "usd-coin": tvl };
}

module.exports = {
  doublecounted: true,
  misrepresentedTokens: true,
  timetravel: false,
};

const config = {
  arbitrum: { network: "arbitrum" },
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl: getTvl };
});
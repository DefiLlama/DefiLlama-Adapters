const axios = require("axios");

const TOKEN_CONFIG = {
  ethereum: ["0xa39986f96b80d04e8d7aeaaf47175f47c23fd0f4"],
  monad:    ["0x650b616b46ff94000eb115926ab8393b90788d76"],
  base:     ["0xd74FB32112b1eF5b4C428Fead8dA8d85A0019009"],
  arbitrum: ["0xa39986f96b80d04e8d7aeaaf47175f47c23fd0f4"],
};

async function getApiTvl(chain) {
  const response = await axios.get(
    "https://api.multipli.fi/multipli/v1/external-aggregator/defillama/tvl/"
  );
  const payload = response.data.payload?.[chain] || {};
  return Object.fromEntries(
    Object.entries(payload).map(([k, v]) => [k.toLowerCase(), v])
  );
}

async function getTokenSupplyTvl(chain, api) {
  const tokens = TOKEN_CONFIG[chain];
  if (!tokens?.length) return {};

  const calls = tokens.map((t) => ({ target: t }));

  const totalSupplies = await api.multiCall({
    abi: "erc20:totalSupply",
    calls,
    permitFailure: true,
  });

  const balances = {};
  tokens.forEach((token, i) => {
    const supply = totalSupplies[i];
    if (supply == null) return;
    balances[`${chain}:${token.toLowerCase()}`] = supply.toString();
  });

  return balances;
}

async function buildTvl(chain, api) {
  const [apiBalances, supplyBalances] = await Promise.all([
    getApiTvl(chain),
    getTokenSupplyTvl(chain, api),
  ]);

  const rpcKeys = new Set(Object.keys(supplyBalances));
  const apiOnly = Object.fromEntries(
    Object.entries(apiBalances).filter(([k]) => !rpcKeys.has(k))
  );

  return { ...supplyBalances, ...apiOnly };
}

module.exports = {
  timetravel: false,
  ethereum: { tvl: (api) => buildTvl("ethereum", api) },
  bsc:      { tvl: (api) => buildTvl("bsc", api) },
  avax:     { tvl: (api) => buildTvl("avax", api) },
  base:     { tvl: (api) => buildTvl("base", api) },
  monad:    { tvl: (api) => buildTvl("monad", api) },
  arbitrum: { tvl: (api) => buildTvl("arbitrum", api) },
};
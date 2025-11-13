const { isWhitelistedToken } = require('../helper/streamingHelper')
const { request } = require("graphql-request");
const sdk = require("@defillama/sdk");

const ENVIO_ENDPOINT = 'https://indexer.hyperindex.xyz/53b7e25/v1/graphql';

// Chains using Envio indexer.
const CHAIN_IDS_ENVIO = {
  abstract: 2741,
  arbitrum: 42161,
  avax: 43114,
  base: 8453,
  berachain: 80094, 
  blast: 81457,
  bsc: 56,
  chz: 88888,
  core: 1116,
  ethereum: 1,
  formnetwork: 478,
  xdai: 100,
  hyperliquid: 999,
  lightlink_phoenix: 1890, 
  linea: 59144,
  mode: 34443,
  morph: 2818,
  optimism: 10,
  polygon: 137,
  scroll: 534352,
  sonic: 146,
  sophon: 50104,
  sseed: 5330,
  unichain: 130, 
  xdc: 50,
  era: 324,
};

// Chains that are not using the Envio indexer but using the Graph.
const SUBGRAPH_ENDPOINTS = {
  sei: 'AJU5rBfbuApuJpeZeaz6NYuYnnhAhEy4gFkqsSdAT6xb',
  // iotex: '2P3sxwmcWBjMUv1C79Jh4h6VopBaBZeTocYWDUQqwWFV',
};

const config = {
  ...Object.fromEntries(Object.keys(CHAIN_IDS_ENVIO).map(k => [k, ENVIO_ENDPOINT])),
  ...SUBGRAPH_ENDPOINTS
};

const envioPayload = `
query getChainData($chainId: numeric!) {
  Contract(where: { chainId: { _eq: $chainId } }) { id address category }
  Asset(where: { chainId: { _eq: $chainId } }) { id chainId symbol }
}
`

const subgraphPayload = `
{
  contracts { id address category }
  assets { id chainId symbol }
}
`

async function getTokensConfig(api, isVesting) {
  const endpoint = config[api.chain];
  if (!endpoint) return { ownerTokens: [] };

  const isSubgraph = !!SUBGRAPH_ENDPOINTS[api.chain];
  const result = isSubgraph
    ? await request(sdk.graph.modifyEndpoint(endpoint), subgraphPayload)
    : await request(ENVIO_ENDPOINT, envioPayload, { chainId: CHAIN_IDS_ENVIO[api.chain] });

  if (!result || (!isSubgraph && !CHAIN_IDS_ENVIO[api.chain])) return { ownerTokens: [] };

  const contracts = result.contracts || result.Contract || [];
  const assets = result.assets || result.Asset || [];

  const owners = contracts.map(i => i.address);

  const tokens = assets
    .filter(asset => isWhitelistedToken(asset.symbol, asset.id, isVesting))
    .map(asset => asset.id.split('-')[2]);

  const ownerTokens = owners.map(owner => [tokens, owner]);
  return { ownerTokens };
}

const tvl = async (api) => api.sumTokens(await getTokensConfig(api, false));
const vesting = async (api) => api.sumTokens(await getTokensConfig(api, true));

module.exports = Object.fromEntries(
  Object.keys(config).map(chain => [chain, { tvl, vesting }])
);

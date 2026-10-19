const sdk = require("@defillama/sdk");
const { transformBalances } = require("../portedTokens");
const { PromisePool } = require("@supercharge/promise-pool");
const { log, sleep } = require("../utils");
const ADDRESSES = require('../coreAssets.json')

const cosmos = sdk.chains.cosmos

// chain -> LCD url (first configured endpoint, `<CHAIN>_LCD` env wins over the sdk defaults).
// Getters keep the historical `endPoints[chain]` string shape while staying env aware.
const endPoints = {}
Object.keys(cosmos.DEFAULT_ENDPOINTS).forEach(chain => {
  Object.defineProperty(endPoints, chain, { enumerable: true, get: () => cosmos.getEndpoint({ chain }) })
})

// NOTE: `block` is accepted for signature compatibility but ignored, as it always was in this helper
// (the legacy `?height=` query param was never honoured by LCDs, and most public nodes are pruned)

// legacy `/wasm/{url}` query (terra classic style), returns the `result` field
async function query(url, block, chain) {
  const res = await cosmos.query({ chain, path: `wasm/${url}` })
  return res?.result
}

async function queryV1Beta1({ chain, paginationKey, block, url, api } = {}) {
  if (api) chain = api.chain
  return cosmos.queryV1Beta1({ chain, url, paginationKey })
}

async function queryV1Beta1V2({ chain, url, limit = 100, block, api, dataKey } = {}) {
  if (api) chain = api.chain
  return cosmos.queryV1Beta1All({ chain, url, dataKey, limit })
}


async function getTokenBalance({ token, owner, block, chain }) {
  let denom = token.native_token?.denom;
  if (denom) return getDenomBalance({ denom, owner, block, chain });
  token = token.token.contract_addr;
  return getBalance({ token, owner, block, chain });
}

function getToken(token) {
  let denom = token.native_token?.denom;
  return denom ? denom : token.token.contract_addr;
}

// cw20 balance as a Number
async function getBalance({ token, owner, block, chain } = {}) {
  const data = await queryContract({
    contract: token,
    block,
    chain,
    data: {
      balance: { address: owner },
    },
  });

  return Number(data.balance);
}

async function sumCW20Tokens({ balances, tokens, owner, block, chain, api, } = {}) {
  if (api) {
    if (!chain) chain = api.chain;
    if (!balances) balances = api.getBalances();
  } else {
    if (!balances) balances = {};
  }
  await Promise.all(
    tokens.map(async (token) => {
      const balance = await getBalance({ token, owner, block, chain, });
      sdk.util.sumSingleBalance(balances, token, balance, chain);
    })
  );
  return balances;
}

// native denom balance as a Number (0 when the account does not hold it)
async function getDenomBalance({ denom, owner, block, chain } = {}) {
  const balance = await cosmos.getDenomBalance({ chain, denom, owner })
  return Number(balance);
}

async function getBalance2({ balances = {}, owner, block, chain, tokens, blacklistedTokens, api, } = {}) {
  const data = await cosmos.getBalances({ chain, owner })
  for (let { denom, amount } of data) {
    if (blacklistedTokens?.includes(denom)) continue;
    if (tokens && !tokens.includes(denom)) continue;
    if (api) api.add(denom, amount);
    else
      sdk.util.sumSingleBalance(balances, denom.replaceAll('/', ':'), amount);
  }
  return balances;
}

// LP stuff
async function totalSupply({ token, block, chain } = {}) {
  const data = await cosmos.getTokenInfo({ chain, contract: token })
  return data.total_supply;
}

async function lpMinter({ token, block, chain } = {}) {
  return cosmos.getLpMinter({ chain, token })
}

async function queryContract({ contract, chain, data, api }) {
  if (api) chain = api.chain;
  return cosmos.queryContract({ chain, contract, data })
}

async function queryContractWithRetries({ contract, chain, data }) {
  return cosmos.queryContractWithRetries({ chain, contract, data })
}

async function queryManyContracts({ contracts = [], chain, data, permitFailure = false }) {
  const results = await cosmos.queryManyContracts({ chain, contracts, data, permitFailure, concurrency: 25 })
  return permitFailure ? results.filter(i => i !== undefined) : results
}


async function queryContracts({ chain, codeId, }) {
  return cosmos.queryContracts({ chain, codeId, limit: 100 })
}

function getAssetInfo(asset) {
  return [
    asset.info.native_token?.denom ?? asset.info.token?.contract_addr,
    Number(asset.amount),
  ];
}

async function unwrapLp({ balances, lpBalance, lpToken, block, chain } = {}) {
  const pair = await lpMinter({ token: lpToken, chain, block });
  const { assets, total_share } = await queryContract({ contract: pair, chain, data: { pool: {} } });
  const [token0, amount0] = getAssetInfo(assets[0]);
  const [token1, amount1] = getAssetInfo(assets[1]);
  balances[token0] =
    (balances[token0] ?? 0) + (amount0 * lpBalance) / total_share;
  balances[token1] =
    (balances[token1] ?? 0) + (amount1 * lpBalance) / total_share;
}

async function queryContractStore({
  contract,
  queryParam,
  block,
  chain = false,
}) {
  return cosmos.queryContractStore({ chain, contract, queryParam })
}

async function sumTokens({ balances, owners = [], chain, owner, tokens, blacklistedTokens, api, }) {
  if (api) {
    if (!chain) chain = api.chain;
    if (!balances) balances = api.getBalances();
  } else {
    if (!balances) balances = {};
  }
  if (!tokens?.length || (tokens?.length === 1 && tokens[0] === ADDRESSES.null)) tokens = undefined;
  if (owner) owners = [owner]
  log(chain, "fetching balances for ", owners.length);
  let parallelLimit = 25;
  if (chain === 'osmosis') parallelLimit = 5;

  const { errors } = await PromisePool.withConcurrency(parallelLimit)
    .for(owners)
    .process(async (owner, i) => {
      await getBalance2({ balances, owner, chain, tokens, blacklistedTokens, api, })
      if (chain === 'osmosis' && owners.length > 100)
        await sleep(3000)
    });

  if (errors && errors.length) throw errors[0];
  return transformBalances(chain, balances);
}

module.exports = {
  endPoints,
  totalSupply,
  getBalance,
  getBalance2,
  getDenomBalance,
  unwrapLp,
  query,
  queryV1Beta1,
  queryV1Beta1V2,
  queryContractStore,
  queryContract,
  queryManyContracts,
  queryContracts,
  sumTokens,
  getTokenBalance,
  getToken,
  sumCW20Tokens,
  queryContractWithRetries,
};

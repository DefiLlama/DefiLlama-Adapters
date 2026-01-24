const sdk = require("@defillama/sdk");
const { transformBalances } = require("../portedTokens");
const { get, post } = require("../http");
const { PromisePool } = require("@supercharge/promise-pool");
const { log, sleep } = require("../utils");
const ADDRESSES = require('../coreAssets.json')

// where to find chain info
// https://proxy.atomscan.com/chains.json
// https://cosmos-chain.directory/chains/cosmoshub
// https://cosmos-chain.directory/chains
// https://celestia.publicnode.com/
// https://api.axelarscan.io/api/getTVL
const endPoints = {
  crescent: "https://mainnet.crescent.network:1317",
  osmosis: "https://rest-osmosis.ecostake.com",
  // cosmos: "https://cosmoshub-lcd.stakely.io",
  cosmos: "https://cosmos-api.polkachu.com",
  kujira: "https://kujira-rest.publicnode.com",
  comdex: "https://rest.comdex.one",
  terra: "https://terra-classic-lcd.publicnode.com",
  terra2: "https://terra-lcd.publicnode.com",
  umee: "https://umee-api.polkachu.com",
  orai: "https://lcd.orai.io",
  juno: "https://juno.api.m.stavr.tech",
  cronos: "https://rest.mainnet.crypto.org",
  chihuahua: "https://rest.cosmos.directory/chihuahua",
  stargaze: "https://rest.stargaze-apis.com",
  quicksilver: "https://rest.cosmos.directory/quicksilver",
  persistence: "https://rest.cosmos.directory/persistence",
  // secret: "https://rpc.ankr.com/http/scrt_cosmos",
  secret: "https://lcd-secret.keplr.app",
  // chihuahua: "https://api.chihuahua.wtf",
  injective: "https://injective-rest.publicnode.com",
  migaloo: "https://migaloo-api.polkachu.com",
  fxcore: "https://fx-rest.functionx.io",
  xpla: "https://dimension-lcd.xpla.dev",
  kava: "https://api2.kava.io",
  neutron: "https://rest-solara.neutron-1.neutron.org",
  quasar: "https://quasar-api.polkachu.com",
  gravitybridge: "https://gravity-api.polkachu.com",
  sei: "https://sei-api.polkachu.com",
  aura: "https://lcd.aura.network",
  archway: "https://api.mainnet.archway.io",
  sifchain: "https://sifchain-api.polkachu.com",
  nolus: "https://lcd.nolus.network",
  nibiru: "https://lcd.nibiru.fi",
  bostrom: "https://lcd.bostrom.cybernode.ai",
  joltify: "https://lcd.joltify.io",
  milkyway: "https://lcd.mainnet.milkyway.zone:443",
  kopi: "https://rest.kopi.money",
  noble: "https://noble-api.polkachu.com",
  mantra: "https://api.mantrachain.io",
  elys: "https://api.elys.network", // https://api.elys.network/#/Query/ElysAmmPoolAll
  pryzm: "https://api.pryzm.zone",
  // agoric: 'https://as-proxy.gateway.atomscan.com/agoric-lcd',
  agoric: 'https://agoric-api.polkachu.com/',
  allora: 'https://allora-api.polkachu.com', // TODO: Verify actual mainnet endpoint
  band: 'https://laozi1.bandchain.org/api',
  celestia: 'https://celestia-rest.publicnode.com',
  dydx: 'https://dydx-rest.publicnode.com',
  carbon: 'https://api.carbon.network',
  evmos: 'https://evmos-api.polkachu.com',
  regen: 'https://rest-regen.ecostake.com',
  sommelier: 'https://sommelier-rpc.polkachu.com',
  stride: 'https://stride-api.polkachu.com',
  babylon: 'https://babylon-api.polkachu.com',
  milkyway_rollup: 'https://archival-rest-moo-1.anvil.asia-southeast.initia.xyz',
  titan: 'https://titan-lcd.titanlab.io',
  provenance: 'https://api.provenance.io',
  xion: 'https://api.xion-mainnet-1.burnt.com',
  embr: 'https://rest-embrmainnet-1.anvil.asia-southeast.initia.xyz', 
  civitia: 'https://rest-civitia-1.anvil.asia-southeast.initia.xyz', 
  echelon_initia: 'https://rest-echelon-1.anvil.asia-southeast.initia.xyz', 
  inertia: 'https://rest.inrt.fi',
  union: 'https://rest.union.build',
  zigchain: 'https://public-zigchain-lcd.numia.xyz'
};

const chainSubpaths = {
  crescent: "crescent",
  osmosis: "osmosis",
  provenance: 'provenance',
  comdex: "comdex",
  umee: "umee",
  kava: "kava",
  joltify: "joltify",
};

// some contract calls need endpoint with higher gas limit
const highGasLimitEndpoints = {
  // 'sei1xr3rq8yvd7qplsw5yx90ftsr2zdhg4e9z60h5duusgxpv72hud3shh3qfl': "https://rest.sei-apis.com",
}

function getEndpoint(chain, { contract } = {}) {
  const highGasEndpoint = highGasLimitEndpoints[contract]
  if (contract && highGasEndpoint) return highGasEndpoint
  if (!endPoints[chain]) throw new Error("Chain not found: " + chain);
  return endPoints[chain];
}

async function query(url, block, chain) {
  block = undefined;
  let endpoint = `${getEndpoint(chain)}/wasm/${url}`;
  if (block !== undefined) {
    endpoint += `&height=${block - (block % 100)}`;
  }
  return (await get(endpoint)).result;
}

async function queryV1Beta1({ chain, paginationKey, block, url, api } = {}) {
  if (api) {
    chain = api.chain
  }
  const subpath = chainSubpaths[chain] || "cosmos";
  let endpoint = `${getEndpoint(chain)}/${subpath}/${url}`;
  if (block !== undefined) {
    endpoint += `?height=${block - (block % 100)}`;
  }
  if (paginationKey) {
    const paginationQueryParam = `pagination.key=${paginationKey}`;
    if (block === undefined) {
      endpoint += "?";
    } else {
      endpoint += "&";
    }
    endpoint += paginationQueryParam;
  }
  return get(endpoint)
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

async function getDenomBalance({ denom, owner, block, chain } = {}) {
  let endpoint = `${getEndpoint(chain)}/bank/balances/${owner}`;
  if (block !== undefined) {
    endpoint += `?height=${block - (block % 100)}`;
  }
  let data = await get(endpoint)
  data = chain === 'terra' ? data.balances : data.result
  const balance = data.find((balance) => balance.denom === denom);
  return balance ? Number(balance.amount) : 0;
}

async function getBalance2({ balances = {}, owner, block, chain, tokens, blacklistedTokens, api, } = {}) {
  const subpath = "cosmos";
  let endpoint = `${getEndpoint(
    chain
  )}/${subpath}/bank/v1beta1/balances/${owner}?pagination.limit=1000`;
  if (block) {
    endpoint += `&height=${block - (block % 100)}`;
  }
  const {
    balances: data,
  } = await get(endpoint);
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
  const data = await query(
    `contracts/${token}/store?query_msg={"token_info":{}}`,
    block,
    chain
  );
  return data.total_supply;
}

async function lpMinter({ token, block, chain } = {}) {
  const data = await query(
    `contracts/${token}/store?query_msg={"minter":{}}`,
    block,
    chain
  );
  return data.minter;
}

async function queryContract({ contract, chain, data, api }) {
  if (api) chain = api.chain;
  if (typeof data !== "string") data = JSON.stringify(data);
  data = Buffer.from(data).toString("base64");
  return (
    await get(
      `${getEndpoint(chain, { contract })}/cosmwasm/wasm/v1/contract/${contract}/smart/${data}`
    )
  ).data;
}

const multipleEndpoints = {
  sei: [
    "https://sei-api.polkachu.com",
    "https://sei-rest.brocha.in",
    "https://rest.sei-apis.com",
    "https://sei-m.api.n0ok.net",
    "https://sei-api.lavenderfive.com",
    "https://api-sei.stingray.plus"
  ],
}

async function queryContractWithRetries({ contract, chain, data }) {
  const rpcs = multipleEndpoints[chain]
  if (rpcs === undefined) {
    return queryContract({ contract, chain, data })
  }
  if (typeof data !== "string") data = JSON.stringify(data);
  data = Buffer.from(data).toString("base64");
  for (let i = 0; i < rpcs.length; i++) {
    try {
      return (
        await get(
          `${rpcs[i]}/cosmwasm/wasm/v1/contract/${contract}/smart/${data}`
        )
      ).data;
    } catch (e) {
      if (i >= rpcs.length - 1) {
        throw e
      }
    }
  }
}

async function queryManyContracts({ contracts = [], chain, data, permitFailure = false }) {
  const parallelLimit = 25
  const { results, errors } = await PromisePool
    .withConcurrency(parallelLimit)
    .for(contracts)
    .process(async (contract) => queryContract({ contract, chain, data }))

  if (!permitFailure && errors && errors.length) throw errors[0]

  return results
}


async function queryContracts({ chain, codeId, }) {
  const res = []
  const limit = 100
  let paginationKey

  do {
    let endpoint = `${getEndpoint(chain)}/cosmwasm/wasm/v1/code/${codeId}/contracts?pagination.limit=${limit}${paginationKey ? `&pagination.key=${encodeURIComponent(paginationKey)}` : ''}`
    const { contracts, pagination } = await get(endpoint)
    paginationKey = pagination.next_key
    res.push(...contracts)
  } while (paginationKey)

  return res
}

function getAssetInfo(asset) {
  return [
    asset.info.native_token?.denom ?? asset.info.token?.contract_addr,
    Number(asset.amount),
  ];
}

async function unwrapLp({ balances, lpBalance, lpToken, block, chain } = {}) {
  const pair = await lpMinter({ token: lpToken, chain, block });
  const { assets, total_share } = await query(
    `contracts/${pair}/store?query_msg={"pool":{}}`,
    block
  );
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
  if (typeof queryParam !== "string") queryParam = JSON.stringify(queryParam);
  const url = `contracts/${contract}/store?query_msg=${queryParam}`;
  return query(url, block, chain);
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

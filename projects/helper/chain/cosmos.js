const axios = require("axios");
const { default: BigNumber } = require("bignumber.js");
const sdk = require("@defillama/sdk");
const { transformBalances } = require("../portedTokens");
const { PromisePool } = require("@supercharge/promise-pool");
const { log } = require("../utils");

// where to find chain info
// https://proxy.atomscan.com/chains.json
// https://cosmos-chain.directory/chains/cosmoshub
// https://cosmos-chain.directory/chains
const endPoints = {
  crescent: "https://mainnet.crescent.network:1317",
  osmosis: "https://lcd.osmosis.zone",
  cosmos: "https://cosmoshub-lcd.stakely.io",
  kujira: "https://rest.cosmos.directory/kujira",
  comdex: "https://rest.comdex.one",
  terra: "https://rest.cosmos.directory/terra",
  terra2: "https://rest.cosmos.directory/terra2",
  umee: "https://umee-api.polkachu.com",
  orai: "https://lcd.orai.io",
  juno: "https://lcd-juno.cosmostation.io",
  cronos: "https://lcd-crypto-org.cosmostation.io",
  chihuahua: "https://rest.cosmos.directory/chihuahua",
  injective: "https://lcd-injective.whispernode.com:443",
  migaloo: "https://migaloo-api.polkachu.com",
  fxcore: "https://fx-rest.functionx.io",
  xpla: "https://dimension-lcd.xpla.dev",
  kava: "https://api2.kava.io",
  neutron: "https://rest-kralum.neutron-1.neutron.org",
  quasar: "https://quasar-api.polkachu.com",
};

const chainSubpaths = {
  crescent: "crescent",
  comdex: "comdex",
  umee: "umee",
  kava: "kava",
};

function getEndpoint(chain) {
  if (!endPoints[chain]) throw new Error("Chain not found: " + chain);
  return endPoints[chain];
}

async function query(url, block, chain) {
  block = undefined;
  let endpoint = `${getEndpoint(chain)}/wasm/${url}`;
  if (block !== undefined) {
    endpoint += `&height=${block - (block % 100)}`;
  }
  console.log(endpoint);
  return (await axios.get(endpoint)).data.result;
}

async function queryV1Beta1({ chain, paginationKey, block, url } = {}) {
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
  return (await axios.get(endpoint)).data;
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

async function getDenomBalance({ denom, owner, block, chain } = {}) {
  let endpoint = `${getEndpoint(chain)}/bank/balances/${owner}`;
  if (block !== undefined) {
    endpoint += `?height=${block - (block % 100)}`;
  }
  const data = (await axios.get(endpoint)).data.result;

  const balance = data.find((balance) => balance.denom === denom);
  return balance ? Number(balance.amount) : 0;
}

async function getBalance2({ balances = {}, owner, block, chain } = {}) {
  const subpath = chainSubpaths[chain] || "cosmos";
  let endpoint = `${getEndpoint(
    chain
  )}/${subpath}/bank/v1beta1/balances/${owner}?pagination.limit=1000`;
  if (block) {
    endpoint += `?height=${block - (block % 100)}`;
  }
  const {
    data: { balances: data },
  } = await axios.get(endpoint);
  for (const { denom, amount } of data)
    sdk.util.sumSingleBalance(balances, denom, amount);
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

async function queryContract({ contract, chain, data }) {
  if (typeof data !== "string") data = JSON.stringify(data);
  data = Buffer.from(data).toString("base64");
  return (
    await axios.get(
      `${getEndpoint(chain)}/cosmwasm/wasm/v1/contract/${contract}/smart/${data}`
    )
  ).data.data;
}

async function queryContracts({ chain, codeId }) {
  return (
    await axios.get(
      `${getEndpoint(chain)}/cosmwasm/wasm/v1/code/${codeId}/contracts`
    )
  ).data.contracts;
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

async function sumTokens({ balances = {}, owners = [], chain, owner }) {
  if (owner) owners = [owner]
  log(chain, "fetching balances for ", owners.length);
  let parallelLimit = 25;

  const { errors } = await PromisePool.withConcurrency(parallelLimit)
    .for(owners)
    .process(async (owner) => getBalance2({ balances, owner, chain }));

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
  queryContracts,
  sumTokens,
  getTokenBalance,
  getToken,
};

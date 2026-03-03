const sdk = require("@defillama/sdk");
const { post } = require("../http");
const { getUniqueAddresses, nullAddress } = require("../tokenMapping");
const { getAssets, getAddressesUTXOs } = require("./cardano/blockfrost");
const { PromisePool } = require("@supercharge/promise-pool");

async function getAda(address) {
  const amount = await getAssets(address);
  return amount.find((i) => i.unit === "lovelace")?.quantity ?? 0;
}

async function getAdaInAddress(address) {
  return (await getAda(address)) / 1e6;
}

async function getTokenBalance(token, owner) {
  const assets = await getAssets(owner);
  return assets.find((i) => i.unit === token)?.quantity ?? 0;
}

async function sumTokens({ owners, balances = {} }) {
  const { results, errors } = await PromisePool.withConcurrency(4)
    .for(owners)
    .process(getAda);

  if (errors && errors.length) throw errors[0];

  for (const balance of results)
    sdk.util.sumSingleBalance(balances, "cardano", balance / 1e6);
  return balances;
}

async function getTokenPrice(address) {
  const endpoint = "https://monorepo-mainnet-prod.minswap.org/graphql?TopPools";
  const {
    data: {
      topPools: [pool],
    },
  } = await post(endpoint, {
    query:
      "query TopPools($asset: String, $favoriteLps: [InputAsset!], $limit: Int, $offset: Int, $sortBy: TopPoolsSortInput) {  topPools(    asset: $asset    favoriteLps: $favoriteLps    limit: $limit    offset: $offset    sortBy: $sortBy  ) {    assetA {      currencySymbol      tokenName      ...allMetadata    }    assetB {      currencySymbol      tokenName      ...allMetadata    }    reserveA    reserveB    lpAsset {      currencySymbol      tokenName    }    totalLiquidity    reserveADA }}        fragment allMetadata on Asset {  metadata {    name    ticker  decimals  }}",
    variables: {
      asset: address,
      offset: 0,
      limit: 20,
      sortBy: {
        column: "TVL",
        type: "DESC",
      },
    },
  });
  if (pool.assetA.metadata) throw new Error("It is not paired against cardano");
  if (+pool.reserveA < 1e9) return 0; // less than 1000 ADA in pool, return price as 0
  return pool.reserveA / pool.reserveB; // price in cardano
}

async function sumTokens2({
  owners = [],
  balances = {},
  owner,
  tokens = [],
  blacklistedTokens = [],
  scripts = [],
}) {
  if (owner) owners = [owner];
  tokens = tokens.map((i) => (i === nullAddress ? "lovelace" : i));
  owners = getUniqueAddresses(owners, "cardano");
  blacklistedTokens = getUniqueAddresses(blacklistedTokens, "cardano");
  tokens = getUniqueAddresses(tokens, "cardano");
  const { results, errors } = await PromisePool.withConcurrency(4)
    .for(owners)
    .process(getAssets);

  if (errors && errors.length) throw errors[0];

  const { results: resultsUTXOs, errors: errorsUTXOs } =
    await PromisePool.withConcurrency(2)
      .for(scripts)
      .process(getAddressesUTXOs);

  if (errorsUTXOs && errorsUTXOs.length) throw errorsUTXOs[0];

  resultsUTXOs.flat().map(addBalances);
  results.map(addBalances);
  return balances;

  function addBalances(bals) {
    if (bals.amount) bals = bals.amount;
    bals.forEach(({ unit, quantity }) => {
      if (+quantity < 10) {
        // sdk.log('Ignoring: ', unit, quantity)
        return;
      }
      const isWhitelisted = !tokens.length || tokens.includes(unit);
      const isBlacklisted = blacklistedTokens.includes(unit);
      if (!isBlacklisted && isWhitelisted)
        sdk.util.sumSingleBalance(balances, unit, quantity, "cardano");
    });
  }
}

function sumTokensExport({
  owners,
  balances,
  owner,
  tokens,
  blacklistedTokens,
  scripts,
}) {
  return async () =>
    sumTokens2({ owners, balances, owner, tokens, blacklistedTokens, scripts });
}

// Best-effort variant: ignores 404s from getAssets/getAddressesUTXOs
async function trySumTokens({
  owners = [],
  balances = {},
  owner,
  tokens = [],
  blacklistedTokens = [],
  scripts = [],
}) {
  // normalize inputs the same way as sumTokens2
  if (owner) owners = [owner];
  tokens = tokens.map((i) => (i === nullAddress ? "lovelace" : i));
  owners = getUniqueAddresses(owners, "cardano");
  blacklistedTokens = getUniqueAddresses(blacklistedTokens, "cardano");
  tokens = getUniqueAddresses(tokens, "cardano");

  const is404 = (e) =>
    e?.raw?.response?.status === 404 ||
    e?.response?.status === 404 ||
    e?.status === 404;

  // Wrap handlers so a 404 returns empty results instead of erroring
  const safeGetAssets = async (addr) => {
    try {
      return await getAssets(addr);
    } catch (e) {
      if (is404(e)) {
        // optional: console.warn(`Ignoring 404 for owner ${addr}`)
        return [];
      }
      throw e;
    }
  };

  const safeGetAddressesUTXOs = async (script) => {
    try {
      return await getAddressesUTXOs(script);
    } catch (e) {
      if (is404(e)) {
        // optional: console.warn(`Ignoring 404 for script ${script}`)
        return [];
      }
      throw e;
    }
  };

  // Run pools with safe handlers
  const { results, errors } = await PromisePool.withConcurrency(4)
    .for(owners)
    .process(safeGetAssets);

  const { results: resultsUTXOs, errors: errorsUTXOs } =
    await PromisePool.withConcurrency(2)
      .for(scripts)
      .process(safeGetAddressesUTXOs);

  // If any non-404 errors happened, still surface them
  const non404 = [...(errors || []), ...(errorsUTXOs || [])].filter(
    (e) => !is404(e)
  );
  if (non404.length) throw non404[0];

  // Aggregate
  resultsUTXOs.flat().map(addBalances);
  results.map(addBalances);
  return balances;

  function addBalances(bals) {
    if (bals?.amount) bals = bals.amount;
    if (!Array.isArray(bals)) return;
    bals.forEach(({ unit, quantity }) => {
      if (+quantity < 10) return;
      const isWhitelisted = !tokens.length || tokens.includes(unit);
      const isBlacklisted = blacklistedTokens.includes(unit);
      if (!isBlacklisted && isWhitelisted) {
        sdk.util.sumSingleBalance(balances, unit, quantity, "cardano");
      }
    });
  }
}

module.exports = {
  getAdaInAddress,
  sumTokens,
  getTokenBalance,
  getTokenPrice,
  sumTokens2,
  sumTokensExport,
  trySumTokens,
};

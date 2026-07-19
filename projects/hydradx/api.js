const sdk = require('@defillama/sdk')
const { ApiPromise, WsProvider } = require("@polkadot/api")
const { postURL } = require('../helper/utils')

// Omnipool constants
const omnipoolAccountId = "7L53bUTBbfuj14UpdCNPwmgzzHSsrsTWBHX5pys32mVWM3C1"

const cgMapping = {
  DAI: 'dai',
  INTR: 'interlay',
  GLMR: 'moonbeam',
  vDOT: 'voucher-dot',
  ZTG: 'zeitgeist',
  CFG: 'centrifuge',
  BNC: 'bifrost-native-coin',
  WETH: 'ethereum',
  DOT: 'polkadot',
  APE: 'apecoin',
  USDC: 'usd-coin',
  USDT: 'tether',
  ASTR: 'astar',
  WBTC: 'wrapped-bitcoin',
  iBTC: 'interbtc',
  HDX: 'hydradx',
  tBTC: 'tbtc',
  AAVE: 'aave',
  PHA: 'pha',
  vASTR: 'bifrost-voucher-astr',
  KSM: 'kusama',
  KILT: 'kilt-protocol',
  SKY: 'sky',
  LINK: 'chainlink',
  SOL: 'solana',
  CRU: 'crust-network',
  RING: 'darwinia-network-native-token',
  EWT: 'energy-web-token',
  UNQ: 'unique-network',
  MYTH: 'mythos',
  WUD: 'gawun-wud',
  ETH: 'ethereum',
  SUB: 'subsocial',
  NODL: 'nodle-network',
  PLMC: 'polimec',
  AJUN: 'ajuna-network',
  TRAC: 'origintrail',
  NEURO: 'neurowebai',
  SQD: 'subsquid',
  ENA: 'ethena',
  PAXG: 'pax-gold',
  jitoSOL: 'jito-staked-sol',
  EURC: 'euro-coin',
  PRIME: 'hastra-prime',
  LAOS: 'laos-network',
  wstETH: 'wrapped-steth',
  LBTC: 'lombard-staked-btc',
  sUSDe: 'ethena-staked-usde',
  sUSDS: 'susds',
  HOLLAR: 'hydrated-dollar',
  PEN: 'pendulum-chain',
  // GDOT: 'gigadot' // skip for doublecount 
};

const INDEXER_URL = 'https://orca-main-aggr-indx.indexer.hydration.cloud/graphql';

// Fetch all stableswap pool account IDs from the indexer.
async function fetchStablepoolAccounts() {
  const query = `{ stableswaps(first: 1000) { nodes { accountId } } }`;
  const res = await postURL(INDEXER_URL, { query });
  return res.data.data.stableswaps.nodes.map(n => n.accountId);
}

// Fetch all XYK pool account IDs and their asset pairs from the indexer.
async function fetchXykPools() {
  const query = `{ xykpools(first: 1000) { nodes { accountId assetAId assetBId } } }`;
  const res = await postURL(INDEXER_URL, { query });
  return res.data.data.xykpools.nodes.map(n => ({
    poolAccountId: n.accountId,
    assetIdA: parseInt(n.assetAId),
    assetIdB: parseInt(n.assetBId),
  }));
}

// Fetch aToken asset IDs and map them to the underlying asset's CoinGecko ID.
// Each node with a symbol like 'aUSDT' maps assetRegistryId -> cgMapping['USDT'].
// Uses cursor-based pagination to exhaust all pages.
async function fetchATokenMapping() {
  const mapping = new Map();
  let after = null;
  while (true) {
    const cursor = after ? `, after: "${after}"` : '';
    const query = `{ assets(first: 500${cursor}) { nodes { assetRegistryId symbol } pageInfo { hasNextPage endCursor } } }`;
    const res = await postURL(INDEXER_URL, { query });
    const { nodes, pageInfo } = res.data.data.assets;
    for (const { assetRegistryId, symbol } of nodes) {
      if (!symbol || !/^a[A-Za-z]/.test(symbol)) continue;
      const underlyingSymbol = symbol.slice(1); // strip leading 'a'
      const cgId = cgMapping[underlyingSymbol];
      if (cgId) {
        mapping.set(parseInt(assetRegistryId), cgId);
      }
    }
    if (!pageInfo.hasNextPage) break;
    after = pageInfo.endCursor;
  }
  return mapping;
}


async function omnipoolTvl(api) {
  const provider = new WsProvider("wss://rpc.hydradx.cloud");
  const polkadotApi = await ApiPromise.create({ provider });
  await polkadotApi.isReady;

  try {
  const stablepoolAccounts = await fetchStablepoolAccounts();

  const processedAssetMetadata = [];
  // Use assets.entries() to fetch all registered assets robustly
  const allAssets = await polkadotApi.query.assetRegistry.assets.entries()

  for (const [key, metaOpt] of allAssets) {
    if (metaOpt.isSome) {
      const meta = metaOpt.unwrap()
      // Use toBigInt() to avoid silent truncation of IDs > Number.MAX_SAFE_INTEGER
      const assetIdBigInt = key.args[0].toBigInt()
      if (assetIdBigInt === 0n || assetIdBigInt > BigInt(Number.MAX_SAFE_INTEGER)) continue;
      const assetIdFromKey = Number(assetIdBigInt)

      processedAssetMetadata.push({
          assetId: assetIdFromKey,
          symbol: meta.symbol.toHuman(),
          decimals: +meta.decimals,
        })
    }
  }

  // Handle HDX (asset ID 0) separately
  const hdxBalance = await polkadotApi.query.system.account(omnipoolAccountId)
  add('hydradx', hdxBalance.data.free / 1e12) // Assuming HDX decimals is 12

  for (const { decimals, assetId, symbol } of processedAssetMetadata) {
    const cgId = cgMapping[symbol]
    if (cgId) {
      if (symbol === 'GDOT') {
        const issuance = await polkadotApi.query.tokens.totalIssuance(assetId)
        add(cgId, Number(issuance) / (10 ** decimals))
      } else {
        const bals = await Promise.all([omnipoolAccountId, ...stablepoolAccounts].map(accId =>
          polkadotApi.call.currenciesApi.account(assetId, accId)
        ))
        const total = bals.reduce((acc, bal) => acc + Number(bal.free), 0) / (10 ** decimals)
        add(cgId, total)
      }
    }
  }

  // Dynamically query aToken balances across all stablepool accounts.
  // The indexer maps each aToken symbol (e.g. 'aUSDT') to its assetRegistryId;
  // we strip the 'a' prefix to resolve the underlying CoinGecko ID via cgMapping.
  const aTokenMapping = await fetchATokenMapping();

  for (const [aTokenAssetId, underlyingCgId] of aTokenMapping) {
    const meta = processedAssetMetadata.find(m => m.assetId === aTokenAssetId);
    if (!meta) continue;
    let total = 0n;
    for (const accId of stablepoolAccounts) {
      const balanceData = await polkadotApi.call.currenciesApi.account(aTokenAssetId, accId);
      total += balanceData.free.toBigInt();
    }
    if (total > 0n) {
      add(underlyingCgId, Number(total) / (10 ** meta.decimals));
    }
  }

  // Add XYK Pool TVL fetched dynamically from the indexer
  const xykPools = await fetchXykPools();

  for (const { poolAccountId, assetIdA, assetIdB } of xykPools) {
    try {
      for (const assetId of [assetIdA, assetIdB]) {
        if (typeof assetId !== 'number' || isNaN(assetId) || assetId > Number.MAX_SAFE_INTEGER) {
          continue;
        }
        // Use already-fetched metadata instead of a separate on-chain call to avoid
        // overflow issues with large asset IDs encoded as storage keys.
        // assetId 0 is HDX, which is omitted from processedAssetMetadata — handle it explicitly.
        const meta = assetId === 0
          ? { symbol: 'HDX', decimals: 12 }
          : processedAssetMetadata.find(m => m.assetId === assetId);
        if (!meta || !meta.symbol) {
          continue;
        }

        const coingeckoId = cgMapping[meta.symbol];
        if (!coingeckoId) {
          continue;
        }

        const balanceEntry = await polkadotApi.call.currenciesApi.account(assetId, poolAccountId);
        const balance = balanceEntry.free.toBigInt();

        if (balance > 0n) {
          const readableBalance = Number(balance) / (10 ** meta.decimals);
          add(coingeckoId, readableBalance);
        }
      }
    } catch (error) {
      console.error(`HydraDX: Error processing XYK pool ${poolAccountId}:`, error);
    }
  }

  return api.getBalances();

  } finally {
    await polkadotApi.disconnect();
  }

  function add(token, bal) {
    api.add(token, bal, { skipChain: true });
  }
}

module.exports = {
  hydradx: { tvl: omnipoolTvl },
}
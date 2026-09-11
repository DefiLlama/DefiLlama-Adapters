const sdk = require('@defillama/sdk')
const { ApiPromise, WsProvider } = require("@polkadot/api")

// Omnipool constants
const omnipoolAccountId = "7L53bUTBbfuj14UpdCNPwmgzzHSsrsTWBHX5pys32mVWM3C1"

const cgMapping = {
  DAI: 'dai',
  // INTR: 'interlay',
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
  // iBTC: 'interbtc',
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

// Everything is read from chain state - the Hydration indexer
// (orca-main-aggr-indx.indexer.hydration.cloud) has extended outages.

// Fetch all stableswap pool account IDs from chain state.
// Pool account = blake2_256("sts" ++ u32_le(pool_id)) - see StableswapAccountIdConstructor
// and POOL_IDENTIFIER in galacticcouncil/hydration-node.
async function fetchStablepoolAccounts(polkadotApi) {
  const { blake2AsU8a } = require('@polkadot/util-crypto');
  const { u8aConcat, stringToU8a } = require('@polkadot/util');
  const pools = await polkadotApi.query.stableswap.pools.entries();
  return pools.map(([key]) => {
    const buf = new Uint8Array(4);
    new DataView(buf.buffer).setUint32(0, key.args[0].toNumber(), true);
    return blake2AsU8a(u8aConcat(stringToU8a('sts'), buf), 256);
  });
}

// Fetch all XYK pool account IDs and their asset pairs from chain state.
async function fetchXykPools(polkadotApi) {
  const pools = await polkadotApi.query.xyk.poolAssets.entries();
  return pools.map(([key, assets]) => {
    const [assetIdA, assetIdB] = assets.unwrap();
    return {
      poolAccountId: key.args[0].toString(),
      assetIdA: assetIdA.toNumber(),
      assetIdB: assetIdB.toNumber(),
    };
  });
}

// Map aToken asset IDs to the underlying asset's CoinGecko ID using the on-chain
// asset registry metadata (symbols like 'aUSDT' map assetId -> cgMapping['USDT']).
function buildATokenMapping(processedAssetMetadata) {
  const mapping = new Map();
  for (const { assetId, symbol } of processedAssetMetadata) {
    if (!symbol || !/^a[A-Z]/.test(symbol)) continue;
    const cgId = cgMapping[symbol.slice(1)];
    if (cgId) mapping.set(assetId, cgId);
  }
  return mapping;
}


async function omnipoolTvl(api) {
  const provider = new WsProvider("wss://rpc.hydradx.cloud");
  const polkadotApi = await ApiPromise.create({ provider });
  await polkadotApi.isReady;

  try {
  const stablepoolAccounts = await fetchStablepoolAccounts(polkadotApi);

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
  const aTokenMapping = buildATokenMapping(processedAssetMetadata);

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

  // Add XYK Pool TVL fetched dynamically from chain state
  const xykPools = await fetchXykPools(polkadotApi);

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
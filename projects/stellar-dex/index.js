const { fetchURL } = require('../helper/utils');

const TVL_URL = 'https://storage.googleapis.com/defillama-stellar-tvl/tvl_agg.json';

// Mapping of Stellar asset codes to CoinGecko IDs
const COINGECKO_MAPPINGS = {
  AQUA: 'aquarius',
  XLM: 'stellar',
  USDC: 'usd-coin',
  EURC: 'euro-coin',
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDT: 'tether',
  PYUSD: 'paypal-usd',
  EURS: 'stasis-eurs',
  VELO: 'velo',
  TFT: 'threefold-token',
  MOBI: 'mobius',
  RIO: 'realio-network',
  GYEN: 'gyen',
  XSGD: 'xsgd',
  TRYB: 'bilira',
  XCHF: 'cryptofranc',
  IDRT: 'rupiah-token',
  QCAD: 'cad-coin',
  AUDD: 'novatti-australian-digital-dollar',
  SolvBTC: 'solv-btc',
  USDY: 'ondo-us-dollar-yield',
  USDM1: 'mountain-protocol-usdm',
  VCHF: 'vnx-swiss-franc',
  VEUR: 'vnx-euro',
  LSP: 'lumenswap',
  XXA: 'ixinium',
  AFR: 'afreum',
  CRDT: 'crdt',
  // Bridged assets — map to underlying
  abUSDC: 'usd-coin',
  abUSDT: 'tether',
  abBUSD: 'binance-usd',
  abBNB: 'binancecoin',
  aeUSDC: 'usd-coin',
  aeUSDT: 'tether',
  aeDAI: 'dai',
  aeETH: 'ethereum',
  apUSDC: 'usd-coin',
  apUSDT: 'tether',
  apMATIC: 'polygon-ecosystem-token',
  asUSDC: 'usd-coin',
  asSOL: 'solana',
  acUSD: 'usd-coin',
  acCELO: 'celo',
  // Etherfuse stablebonds
  USTRY: 'etherfuse-ustry',
  TESOURO: 'etherfuse-tesouro',
  // Stellar-native tokens
  SSLX: 'starslax',
  SCOP: 'scopuly',
  // Yield-bearing tokens — map to underlying
  yBTC: 'bitcoin',
  yETH: 'ethereum',
  yXLM: 'stellar',
  yUSDC: 'usd-coin',
  xSolvBTC: 'solv-btc',
  BTCLN: 'bitcoin',
  ARST: 'argentine-peso',
  ARS: 'argentine-peso',
  BENJI: 'franklin-templeton-benji',
  USD: 'usd-coin',
  USDGLO: 'glo-dollar',
};

// Price scaling for assets with non-standard denominations
const PRICE_SCALING = {
  BTCLN: 1e-8, // 1 BTCLN = 1 satoshi
};

// Cross-chain EVM contract addresses for bridged assets
const CROSS_CHAIN_MAPPINGS = {
  SPKCC: { chain: 'ethereum', address: '0x4f33acf823e6eeb697180d553ce0c710124c8d59' },
  eurSPKCC: { chain: 'ethereum', address: '0x3868d4e336d14d38031cf680329d31e4712e11cc' },
  USTBL: { chain: 'ethereum', address: '0xe4880249745eac5f1ed9d8f7df844792d560e750' },
  EUTBL: { chain: 'ethereum', address: '0xa0769f7a8fc65e47de93797b4e21c073c117fc80' },
  JAAA: { chain: 'ethereum', address: '0x5a0f93d040de44e78f251b03c43be9cf317dcf64' },
  JTRSY: { chain: 'ethereum', address: '0x8c213ee79581ff4984583c6a801e5263418c4b86' },
  deJAAA: { chain: 'ethereum', address: '0x5a0f93d040de44e78f251b03c43be9cf317dcf64' },
  deJTRSY: { chain: 'ethereum', address: '0x8c213ee79581ff4984583c6a801e5263418c4b86' },
};

// Offchain pricing code fallbacks for assets not in COINGECKO_MAPPINGS
const OFFCHAIN_PRICING_CODES = {
  AAULL1: 'USD',
  ACREDIT04: 'BRL',
  ACREDIT05: 'BRL',
  ACREDIT06: 'BRL',
  BB1: 'EUR',
  BRPL01: 'BRL',
  CARTAO56: 'BRL',
  CARTAO57: 'BRL',
  CHILLI10: 'BRL',
  CHILLI11: 'BRL',
  DUX30: 'BRL',
  JEITTO36: 'BRL',
  JEITTO37: 'BRL',
  MBCREDIT10: 'BRL',
  MBCREDSB10: 'BRL',
  MEDTKN04: 'BRL',
  POOLCP02: 'BRL',
  SBC: 'USD',
  UKTBL: 'GBP',
  deJAAA: 'JAAA',
  deJTRSY: 'JTRSY',
  gBENJI: 'USD',
  sgBENJI: 'USD',
};

async function fetchBalanceData() {
  const { data } = await fetchURL(TVL_URL);
  if (Array.isArray(data)) return data;
  // Handle NDJSON (one JSON object per line)
  return String(data).trim().split('\n').map(line => JSON.parse(line));
}

function getRowsForTimestamp(rows, timestamp) {
  if (!timestamp || timestamp > Date.now() / 1000 - 30 * 60) {
    const latestDay = rows.reduce((max, r) => r.day > max ? r.day : max, '');
    return rows.filter(r => r.day === latestDay);
  }
  const targetDate = new Date(timestamp * 1000).toISOString().slice(0, 10);
  const dayRows = rows.filter(r => r.day === targetDate);
  if (dayRows.length) return dayRows;
  const priorDays = [...new Set(rows.map(r => r.day))].filter(d => d <= targetDate).sort();
  const nearest = priorDays[priorDays.length - 1];
  return nearest ? rows.filter(r => r.day === nearest) : [];
}

function aggregateBalances(rows) {
  const byCode = {};
  for (const row of rows) {
    const code = row.asset_code;
    const tvl = Number(row.total_tvl) || 0;
    if (!byCode[code]) {
      byCode[code] = { ...row, balance: tvl, _maxTvl: tvl };
    } else {
      byCode[code].balance += tvl;
      if (tvl > byCode[code]._maxTvl) {
        byCode[code].asset_issuer = row.asset_issuer;
        byCode[code].asset_type = row.asset_type;
        byCode[code]._maxTvl = tvl;
      }
    }
  }
  return byCode;
}

function getIdentifiersForAsset(code) {
  const ids = [];

  // Method 2: Known CoinGecko mapping (priority)
  if (COINGECKO_MAPPINGS[code]) {
    ids.push(`coingecko:${COINGECKO_MAPPINGS[code]}`);
  } else {
    // Method 3: CoinGecko symbol guess
    ids.push(`coingecko:${code.toLowerCase()}`);
  }

  // Method 4: Offchain pricing code fallback
  if (OFFCHAIN_PRICING_CODES[code]) {
    const offchain = OFFCHAIN_PRICING_CODES[code];
    const mapped = COINGECKO_MAPPINGS[offchain] || offchain.toLowerCase();
    const offchainId = `coingecko:${mapped}`;
    if (!ids.includes(offchainId)) ids.push(offchainId);
  }

  // Method 5: Cross-chain EVM contract
  if (CROSS_CHAIN_MAPPINGS[code]) {
    const { chain, address } = CROSS_CHAIN_MAPPINGS[code];
    ids.push(`${chain}:${address}`);
  }

  return ids;
}

function getPricesUrl(tokenIds, timestamp) {
  const base = 'https://coins.llama.fi/';
  const path = timestamp && timestamp < (Date.now() / 1000 - 30 * 60)
    ? `prices/historical/${timestamp}/`
    : 'prices/current/';
  return `${base}${path}${tokenIds.join(',')}`;
}

async function batchFetchPrices(identifierMap, timestamp) {
  const allIds = [...new Set(Object.values(identifierMap).flat())];
  const prices = {};
  const batchSize = 50;
  for (let i = 0; i < allIds.length; i += batchSize) {
    const batch = allIds.slice(i, i + batchSize);
    const url = getPricesUrl(batch, timestamp);
    const { data } = await fetchURL(url);
    Object.assign(prices, data.coins || {});
  }
  return prices;
}

async function fetchStellarStablecoins() {
  try {
    const { data } = await fetchURL('https://stablecoins.llama.fi/stablecoins');
    const result = {};
    for (const sc of data.peggedAssets || []) {
      if ((sc.chains || []).includes('Stellar') && sc.price) {
        result[sc.symbol.toUpperCase()] = { price: sc.price };
      }
    }
    return result;
  } catch (e) { return {}; }
}

async function tvl(api) {
  const timestamp = api.timestamp;
  const allRows = await fetchBalanceData();
  const rows = getRowsForTimestamp(allRows, timestamp);
  const aggregated = aggregateBalances(rows);

  // Build identifier map: { asset_code: [id1, id2, ...] }
  const identifierMap = {};
  for (const code of Object.keys(aggregated)) {
    identifierMap[code] = getIdentifiersForAsset(code);
  }

  // Fetch all prices from coins.llama.fi
  const allPrices = await batchFetchPrices(identifierMap, timestamp);

  // Method 6: Stablecoins endpoint fallback (current only)
  let stablePrices = {};
  if (!timestamp || timestamp > Date.now() / 1000 - 30 * 60) {
    stablePrices = await fetchStellarStablecoins();
  }

  // Resolve price per asset and sum TVL
  let totalUsd = 0;
  for (const [code, row] of Object.entries(aggregated)) {
    let price = null;

    for (const id of identifierMap[code]) {
      if (allPrices[id]?.price) {
        price = allPrices[id].price;
        break;
      }
    }

    if (!price && stablePrices[code]?.price) {
      price = stablePrices[code].price;
    }

    if (!price) continue;

    if (PRICE_SCALING[code]) price *= PRICE_SCALING[code];

    totalUsd += row.balance * price;
  }

  api.addUSDValue(totalUsd);
}

module.exports = {
  methodology: 'Total value of assets in the Stellar DEX (liquidity pools and open offers), priced via DefiLlama.',
  stellar: { tvl },
  timetravel: true,
  misrepresentedTokens: false,
  start: 1659916800, // 2022-08-08 UTC
};

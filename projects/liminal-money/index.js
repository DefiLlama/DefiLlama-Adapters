const { getConfig } = require('../helper/cache');

const API_URL = "https://api.liminal.money/api/info/tvl-history";
const API_ASSET_URL = "https://api.liminal.money/api/info/strategy-assets";
const MAX_DIFF_MS = 12 * 60 * 60 * 1000;

const COINGECKO_MAPPING = {
  HYPE: "hyperliquid",
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  USDE: "ethena-usde",
  PUMP: "pump-fun",
  USDC: "usd-coin",
  THBILL: "theo-short-duration-us-treasury-fund",
  FARTCOIN: "fartcoin",
  XPL: "plasma"
};

async function fetchAssetList() {
  const response = await getConfig('liminal-money/asset-list', API_ASSET_URL);
  const assets = response.data;
  return assets.map(({ _id, perpName, spotName }) => ({ id: _id, perpName, spotName }))
}

const getClosestRecord = async (api) => {
  const targetMs = api.timestamp * 1000;
  const { data: records } = await getConfig('liminal-money/tvl-history', API_URL);

  const closest = records.customized
    .map((r) => ({ ...r, diff: Math.abs(new Date(r.timestamp).getTime() - targetMs) }))
    .filter((r) => r.diff <= MAX_DIFF_MS)
    .reduce((target, curr) => (!target || curr.diff < target.diff ? curr : target), null);

  if (!closest) return null;

  const assetMetaList = await fetchAssetList();
  const { timestamp: ts, totalValueLocked, breakdown } = closest;

  const enrichedAssetBreakdown = breakdown.assetBreakdown.map(item => {
    const meta = assetMetaList.find(m => m.id === item.assetId) || {};
    return { ...item, perpName: meta.perpName, spotName: meta.spotName };
  });

  const enrichedBreakdown = { ...breakdown, assetBreakdown: enrichedAssetBreakdown };
  return { timestamp: ts, totalValueLocked, breakdown: enrichedBreakdown };
}

async function addTokenizdData(api) {
  const targetMs = api.timestamp * 1000;
  const { data: records } = await getConfig('liminal-money/tvl-history', API_URL);


  const getClosestRecord = data => data
    .map((r) => ({ ...r, diff: Math.abs(new Date(r.timestamp).getTime() - targetMs) }))
    .filter((r) => r.diff <= MAX_DIFF_MS)
    .reduce((target, curr) => (!target || curr.diff < target.diff ? curr : target), null);

  
  
  
  records.tokenized.forEach(i => {
    const record = getClosestRecord(i.data)
    if (record) api.addUSDValue(+record.totalAssets)
  })
}

const tvl = async (api) => {
  const record = await getClosestRecord(api);
  if (!record) return;

  await addTokenizdData(api);

  const { spotUsdc, perpUsdc, assetBreakdown } = record.breakdown
  api.addCGToken('usd-coin', spotUsdc+perpUsdc)

  assetBreakdown.forEach(({ perpName, spotHolding, perpMarginUsed }) => {
    if (!COINGECKO_MAPPING[perpName]) {
      api.log(`Liminal Money: Missing Coingecko mapping for asset ${perpName}, skipping TVL addition.`);
      return;
    }
    const cgName = COINGECKO_MAPPING[perpName] || perpName.toLowerCase();
    api.addCGToken(cgName, spotHolding);
    api.addCGToken('usd-coin', perpMarginUsed);
  });
}

module.exports = {
  hyperliquid: { tvl }
}

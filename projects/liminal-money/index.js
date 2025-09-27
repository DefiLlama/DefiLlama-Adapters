const axios = require('axios')

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
  XPL: "plasma"
};

async function fetchAssetList() {
  const response = await axios.get(API_ASSET_URL);
  const assets = response.data.data;
  return assets.map(({ _id, perpName, spotName }) => ({ id: _id, perpName, spotName }))
}

const getClosestRecord = async (api) => {
  const targetMs = api.timestamp * 1000;
  const { data: { data: records } } = await axios.get(API_URL);

  const closest = records
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

const tvl = async (api) => {
  const record = await getClosestRecord(api);
  if (!record) return;
  const { spotUsdc, perpUsdc, assetBreakdown } = record.breakdown
  api.addCGToken('usd-coin', spotUsdc+perpUsdc)

  assetBreakdown.forEach(({ perpName, spotHolding, perpMarginUsed }) => {
    const cgName = COINGECKO_MAPPING[perpName] || perpName.toLowerCase();
    api.addCGToken(cgName, spotHolding);
    api.addCGToken('usd-coin', perpMarginUsed);
  });
}

module.exports = {
  hyperliquid: { tvl }
}

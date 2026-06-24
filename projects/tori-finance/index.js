const ADDRESSES = require('../helper/coreAssets.json');

const VAULT = '0xcd69123b3FBBfC666E1f6a501da27B564C00De54';
const USDC = ADDRESSES.ethereum.USDC;

// trUSD is Tori Finance's USD-pegged stablecoin (18 decimals), not yet on
// CoinGecko. getTotalAssets() returns raw 18-decimal units. We map to USDC
// (6 decimals) so DefiLlama prices it at $1.
async function tvl(api) {
  const total = await api.call({ abi: 'uint256:getTotalAssets', target: VAULT });
  // convert 18-decimal trUSD → 6-decimal USDC
  const usdc = BigInt(total) / BigInt(1e12);
  api.add(USDC, usdc.toString());
}

module.exports = {
  methodology: 'Total assets in the Upshift Tori ecosystem vault (sMUSD). trUSD mapped to USDC for pricing.',
  doublecounted: true,
  ethereum: { tvl },
};

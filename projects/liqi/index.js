// Liqi Digital Assets — TidcRWAVault TVL adapter
// Chain: XDC Network (XDC)
// Contract: TidcRWAVault UUPS proxy (implementation: TidcRWAVaultV3)
//
// TVL = sum of face values of all ACTIVE tokenized receivables (TIDC / RWA).
// The vault stores values in 6-decimal USDL units; getTVL() returns the cached
// sum scaled to 18 decimals (totalValue * 1e12 per asset).  Dividing by 1e18
// yields the plain USD amount.

const VAULT_PROXY = "0xf4E895546FC676B591450527275eBa31A126F15c";

const ABI = {
  getTVL: "function getTVL() view returns (uint256)",
};

async function tvl(api) {
  const rawTVL = await api.call({
    abi: ABI.getTVL,
    target: VAULT_PROXY,
  });

  // getTVL() returns _cachedTVL in 18-decimal units:
  //   _cachedTVL = sum(totalValue_6dec * 1e12) = sum(USD * 1e6 * 1e12) = USD_total * 1e18
  // Dividing by 1e18 gives the plain USD amount.
  const tvlUSD = Number(BigInt(rawTVL) / 10n ** 18n);
  api.addUSDValue(tvlUSD);
}

module.exports = {
  methodology:
    "TVL is the sum of face values of all ACTIVE tokenised receivables (TIDC) registered in the TidcRWAVault on XDC Network. Values are denominated in USDL (1 USDL = 1 USD) and read via the O(1) cached getTVL() function introduced in TidcRWAVaultV3.",
  hallmarks: [
    ["2024-09-25", "TidcRWAVault launched on XDC mainnet"],
  ],
  xdc: {
    tvl,
  },
};

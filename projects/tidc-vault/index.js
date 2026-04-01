// Liqi Digital Assets — TidcRWAVault TVL adapter
// Chain: XDC Network (XDC)
// Proxy:          0xf4E895546FC676B591450527275eBa31A126F15c  (ERC1967 UUPS proxy)
// Implementation: 0xe69418F34BF84F9D8FbEa2Eb4dc2219b01B25fF6  (TidcRWAVault — verified on XDCScan)
//
// TVL = sum of face values of all ACTIVE tokenized receivables (TIDC / RWA).
// getTVL() returns _cachedTVL, an O(1) on-chain aggregate maintained by the contract:
//   _cachedTVL = sum(faceValue_6dec * 1e12)  →  USD_total * 1e18
// Dividing by 1e18 gives the plain USD amount, reported via api.addUSDValue().

const VAULT_PROXY = "0xf4E895546FC676B591450527275eBa31A126F15c";

async function tvl(api) {
  const rawTVL = await api.call({
    abi: "function getTVL() view returns (uint256)",
    target: VAULT_PROXY,
  });

  api.addUSDValue(Number(BigInt(rawTVL) / 10n ** 18n));
}

module.exports = {
  methodology:
    "TVL is the sum of face values of all ACTIVE tokenised receivables (TIDC) registered in the TidcRWAVault on XDC Network. Values are denominated in USDL (1 USDL = 1 USD) and read via the O(1) cached getTVL() function. The vault now tracks 1,800+ individual assets; the cached approach replaced the previous per-asset iteration which timed out at scale.",
  hallmarks: [
    ["2024-09-25", "TidcRWAVault V1 launched on XDC mainnet"],
    ["2025-04-01", "New proxy deployed — O(1) TVL cache introduced to support 1,800+ assets"],
  ],
  xdc: {
    tvl,
  },
};

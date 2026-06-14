// DefiLlama TVL adapter — Auxite (tokenized precious metals on Base)
// ----------------------------------------------------------------------------
// Drop this into your DefiLlama-Adapters fork at: projects/auxite/index.js
// then open a PR. It REPLACES any adapter pointing at the old mirror contracts
// (0x24acdf…/0xb03471…/0xe5640d…/0x1c99a4…), which are being retired.
//
// Model: each token's on-chain totalSupply = full physical vault metal (AUM),
// 3 decimals (1 token = 1 gram). TVL = Σ grams × spot USD/gram (issuer NAV).
//
// Canonical AuxiteMetal contracts (Base mainnet, deployed 2026-06-09):
const TOKENS = {
  AUXG: "0xCef9D7593E8Ba796eE05C54B8983B7749bB1218a", // gold
  AUXS: "0xB0aC63aeD12b5A0Ee710618D99444bf126068c1a", // silver
  AUXPT: "0x39F314fb20668997A2ADDaB1eA9236e0072D5E2D", // platinum
  AUXPD: "0x6e4837fCf158D15ABFdf90b3954D041D452BE832", // palladium
};

const GRAMS_PER_TROY_OZ = 31.1034768;
const TOKEN_DECIMALS = 3; // 1 gram = 1000 raw units

// Physical precious metals have NO on-chain DEX price, so the canonical valuation
// is the issuer's published per-gram NAV (gold/silver/platinum/palladium), the
// same feed that backs the tokens 1:1. Supply is still read on-chain (verifiable);
// only the $/gram valuation comes from the NAV feed.
const PRICES_URL = "https://vault.auxite.io/api/prices"; // { prices: { AUXG, AUXS, AUXPT, AUXPD } } USD/gram

async function tvl(api) {
  const symbols = Object.keys(TOKENS);

  // On-chain supply per token (grams).
  const supplies = await api.multiCall({
    abi: "uint256:totalSupply",
    calls: symbols.map((s) => TOKENS[s]),
  });
  const grams = {};
  symbols.forEach((s, i) => {
    grams[s] = Number(supplies[i]) / 10 ** TOKEN_DECIMALS;
  });

  // Valuation via issuer NAV: TVL = Σ grams × USD/gram.
  let priced = false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(PRICES_URL, { signal: controller.signal }).then((r) => r.json());
    clearTimeout(timeout);
    const px = (res && res.prices) || {};
    let usd = 0;
    for (const s of symbols) {
      const perGram = Number(px[s]);
      if (grams[s] > 0 && perGram > 0) usd += grams[s] * perGram;
    }
    // addUSDValue: add a raw USD amount to TVL (DefiLlama ChainApi).
    if (usd > 0) {
      api.addUSDValue(usd);
      priced = true;
    }
  } catch (e) {
    // NAV feed unreachable — log and fall through to the gold-only fallback below.
    console.log("Auxite NAV fetch failed, using PAX Gold fallback:", e.message);
  }

  // Fallback: if the NAV feed is unreachable, value gold via PAX Gold (the
  // dominant share of AUM) so TVL is still meaningful rather than zero.
  if (!priced && grams.AUXG > 0) {
    api.addCGToken("pax-gold", grams.AUXG / GRAMS_PER_TROY_OZ);
  }

  return api.getBalances();
}

module.exports = {
  methodology:
    "AUM = on-chain totalSupply (grams) of each Auxite metal token on Base, valued at the issuer's published per-gram USD NAV for gold, silver, platinum and palladium. Each token is 1:1 backed by allocated physical metal held in regulated vaults (Istanbul, Dubai, Singapore); independently attested by The Network Firm.",
  base: {
    tvl,
  },
};

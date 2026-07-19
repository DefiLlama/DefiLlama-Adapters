// Injective staking TVL adapter
// TVL equals total INJ bonded in staking
// Reads Cosmos staking pool bonded_tokens via LCD endpoints with fallback

const LCDS = [
  "https://lcd.injective.network",
  "https://injective-rest.publicnode.com",
  "https://k8s.mainnet.lcd.injective.network:443",
];

const INJ_COINGECKO = "coingecko:injective-protocol";
const INJ_DECIMALS = 10n ** 18n;

async function fetchJsonWithFallback(path) {
  let lastErr;
  for (const base of LCDS) {
    try {
      const res = await fetch(`${base}${path}`, {
        method: "GET",
        headers: { accept: "application/json" },
      });

      const txt = await res.text();

      if (!res.ok) {
        lastErr = new Error(`LCD ${base} error ${res.status}: ${txt.slice(0, 160)}`);
        continue;
      }

      let j;
      try {
        j = JSON.parse(txt);
      } catch (e) {
        lastErr = new Error(`LCD ${base} returned non JSON: ${txt.slice(0, 160)}`);
        continue;
      }

      return j;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("All LCD endpoints failed");
}

function toNumberAmount(amountBigInt, decimalsBigInt) {
  // Convert to a JS number in token units
  // This will be safe enough for display and pricing even if it loses some precision
  return Number(amountBigInt) / Number(decimalsBigInt);
}

async function tvl() {
  const j = await fetchJsonWithFallback("/cosmos/staking/v1beta1/pool");

  const bondedStr = j?.pool?.bonded_tokens;
  if (!bondedStr) return {};

  const bonded = BigInt(bondedStr);
  const inj = toNumberAmount(bonded, INJ_DECIMALS);

  return { [INJ_COINGECKO]: inj };
}

module.exports = {
  timetravel: false,
  methodology:
    "Counts total INJ bonded in staking by reading the Cosmos staking pool bonded_tokens via Injective LCD endpoints with fallback.",
  injective: { tvl },
};

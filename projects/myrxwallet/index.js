// DefiLlama TVL Adapter -- MyRxWallet DEX (MYRX-MAINNET, Chain 8472)
// Healthcare-native blockchain rails: payment layer for patients, providers, and pharmacies.

const RPC            = "https://rpc.myrxwallet.io";
const WMRT_WBTC_PAIR = "0x16Bf6e74B9feE4306a7D268468Fc4d45C2F4B0C3";
const WMRT_MUSD_PAIR = "0xf1946991eA67CdBB8d74b3124003D55A2069bd2e";
const WMRT           = "0x00e69754c21090d69d29a2abe3b6cf153d3f1df7";

async function ethCall(target, data) {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", method: "eth_call", params: [{ to: target, data }, "latest"], id: 1 }),
  });
  const j = await res.json();
  if (j.error) throw new Error(j.error.message);
  return j.result;
}

function parseReserves(raw) {
  if (!raw || raw.length < 130) throw new Error("bad reserves");
  return [BigInt("0x" + raw.slice(2, 66)), BigInt("0x" + raw.slice(66, 130))];
}

async function addPairTVL(api, pairAddr, label, coingeckoKey, otherDecimals) {
  try {
    const [resRaw, tok0Raw] = await Promise.all([
      ethCall(pairAddr, "0x0902f1ac"),
      ethCall(pairAddr, "0x0dfe1681"),
    ]);
    const [r0, r1] = parseReserves(resRaw);
    if (r0 === 0n && r1 === 0n) return;
    const tok0 = ("0x" + tok0Raw.slice(26)).toLowerCase();
    const [wmrt, other] = tok0 === WMRT.toLowerCase() ? [r0, r1] : [r1, r0];
    if (other === 0n || wmrt === 0n) return;

    // BigInt-safe: keep 8 decimals of precision throughout
    const PREC = 100_000_000n;
    const otherDec = BigInt(10 ** otherDecimals);

    // other-side TVL
    const otherVal = Number(other * PREC / otherDec) / Number(PREC);
    api.add(coingeckoKey, otherVal);

    // WMRT-side TVL: price = other/wmrt adjusted for decimals
    const priceNum = Number(other * PREC * (10n ** 18n) / (wmrt * otherDec)) / Number(PREC);
    const wmrtVal = Number(wmrt) / 1e18 * priceNum;
    api.add(coingeckoKey, wmrtVal);
  } catch (err) {
    console.error(`[myrxwallet] ${label} skipped:`, err.message);
  }
}

async function tvl(api) {
  await addPairTVL(api, WMRT_WBTC_PAIR, "WMRT/WBTC", "bitcoin", 8);
  await addPairTVL(api, WMRT_MUSD_PAIR, "WMRT/MUSD", "usd-coin", 8);
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: "Sums reserves in WMRT/WBTC and WMRT/MUSD pairs on MYRX-MAINNET (Chain 8472). WBTC as BTC, MUSD as USD.",
  start: 1747267200,
  myrx: { tvl },
};

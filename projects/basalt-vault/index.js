// Basalt Vault — delta-neutral GMX v2 BTC/USD yield on Arbitrum.
// Each user owns an NFT-bound vault (VaultCore clone). The vault holds GMX v2 GM
// (BTC/USD) as collateral inside a Dolomite isolation account and borrows WBTC to
// run the delta-neutral hedge. TVL is the net equity of every vault:
//   sum over vaults of ( GM collateral value - WBTC debt value )
// priced by the Dolomite oracle. Borrowed WBTC (leverage) is excluded, and the GM
// already lives inside GMX, so this is flagged as misrepresented/double-counted.

const FACTORY = "0x08e466fb09617d16ed27da9ea43ba601665f3b89"; // VaultCoreNftFactory
const DOLOMITE = "0x6Bd780E7fDf01D77e4d475c821f1e7AE05409072"; // DolomiteMargin

const GM_MARKET = 32;
const WBTC_MARKET = 4;
const ISO_ACCOUNT = 100; // Dolomite isolation sub-account used by every vault

const ZERO = "0x0000000000000000000000000000000000000000";

const abi = {
  nextTokenId: "uint256:nextTokenId",
  vaultByTokenId: "function vaultByTokenId(uint256) view returns (address)",
  basaltState: "function basaltState() view returns (address)",
  dolomiteIsolationVault: "function dolomiteIsolationVault() view returns (address)",
  getAccountWei:
    "function getAccountWei((address owner, uint256 number) account, uint256 market) view returns ((bool sign, uint256 value))",
  getMarketPrice: "function getMarketPrice(uint256 market) view returns ((uint256 value))",
};

async function tvl(api) {
  const n = Number(await api.call({ target: FACTORY, abi: abi.nextTokenId }));
  if (!n) return api.addUSDValue(0);

  const ids = Array.from({ length: n }, (_, i) => i + 1);
  const notZero = (a) => a && a.toLowerCase() !== ZERO;

  // Every vault is enumerated on-chain; drop never-minted / burned ids at each hop
  // so a zero address can never make a downstream call revert.
  const vaults = (
    await api.multiCall({
      target: FACTORY,
      abi: abi.vaultByTokenId,
      calls: ids.map((id) => ({ params: [id] })),
    })
  ).filter(notZero);
  if (!vaults.length) return api.addUSDValue(0);

  const states = (
    await api.multiCall({ abi: abi.basaltState, calls: vaults.map((target) => ({ target })) })
  ).filter(notZero);

  // Only vaults whose Dolomite isolation vault has been created hold a position.
  const active = (
    await api.multiCall({ abi: abi.dolomiteIsolationVault, calls: states.map((target) => ({ target })) })
  ).filter(notZero);
  if (!active.length) return api.addUSDValue(0);

  const [gmWei, wbtcWei, gmPrice, wbtcPrice] = await Promise.all([
    api.multiCall({
      target: DOLOMITE,
      abi: abi.getAccountWei,
      calls: active.map((owner) => ({ params: [{ owner, number: ISO_ACCOUNT }, GM_MARKET] })),
    }),
    api.multiCall({
      target: DOLOMITE,
      abi: abi.getAccountWei,
      calls: active.map((owner) => ({ params: [{ owner, number: ISO_ACCOUNT }, WBTC_MARKET] })),
    }),
    api.call({ target: DOLOMITE, abi: abi.getMarketPrice, params: [GM_MARKET] }),
    api.call({ target: DOLOMITE, abi: abi.getMarketPrice, params: [WBTC_MARKET] }),
  ]);

  // Dolomite price precision = 36 - tokenDecimals (GM: E18, WBTC: E28). Multiplying a
  // raw wei balance by the market price yields a 36-decimal USD value.
  const gmP = BigInt(gmPrice.value);
  const wbtcP = BigInt(wbtcPrice.value);

  let nav36 = 0n;
  for (let i = 0; i < active.length; i++) {
    const gm = gmWei[i];
    const wb = wbtcWei[i];
    const gmCollateral = gm.sign ? BigInt(gm.value) : 0n; // positive = collateral
    const wbtcDebt = !wb.sign ? BigInt(wb.value) : 0n; // negative = borrowed
    const wbtcSurplus = wb.sign ? BigInt(wb.value) : 0n; // positive = leftover WBTC
    nav36 += gmCollateral * gmP + wbtcSurplus * wbtcP - wbtcDebt * wbtcP;
  }

  const usd = Number(nav36) / 1e36;
  api.addUSDValue(usd > 0 ? usd : 0);
}

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "TVL is the net equity summed over every Basalt vault: (GM collateral value + any WBTC surplus - WBTC debt value), priced by the Dolomite oracle and floored at zero. Each NFT-bound vault holds GMX v2 GM (BTC/USD) collateral in a Dolomite isolation account and borrows WBTC for a delta-neutral hedge. Borrowed WBTC (leverage) is excluded and the underlying GM is already counted under GMX, so misrepresentedTokens is set to avoid double-counting into the chain total.",
  start: 1778198400, // 2026-05-08 — Deployment 6 on Arbitrum One
  arbitrum: { tvl },
};

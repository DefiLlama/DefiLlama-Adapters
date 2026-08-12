/**
 * LuckyLaunch — dual-chain (Avalanche + Robinhood) launchpad + native AMM DEX.
 *
 * Every launch runs two phases, both custodying AVLO (the quote asset):
 *   Phase A — a bonding-curve presale pool that holds the AVLO raised so far.
 *   Phase B — after graduation, a native x*y=k AMM ("AvaLove DEX") whose AVLO
 *             reserve is the pool's liquidity. LP is permanently locked.
 *
 * TVL = all AVLO locked across every pool + AMM on each chain. The launchpad's
 * own freshly-minted tokens are intentionally excluded (DefiLlama convention for
 * launchpad-created assets), so we only count the external quote asset (AVLO).
 *
 * Pools are enumerated purely from public on-chain state via each chain's
 * LuckyFactory (launchesLength + getLaunches paging). No private data, no
 * external price calls — DefiLlama's coins service prices AVLO.
 */

const AVLO = {
  avax: "0x54eEeB249E3AE445f21eb006DEbB33eFa2B4b3Bb",
  robinhood: "0x7e37298e240c1E644F6F9F96b6A3AA6C5aea9885",
};

const FACTORY = {
  avax: "0x77B5D9Fbc8A39A832a2293D8987f12d9e24ae362",
  robinhood: "0x853203C0f6C7EC1f446B5D0dB3dF00F0c9aA0138",
};

const abi = {
  launchesLength: "function launchesLength() view returns (uint256)",
  getLaunches:
    "function getLaunches(uint256 offset, uint256 limit) view returns (tuple(address pool, address amm, address token, address creator, string name, string symbol, uint256 createdAt)[])",
};

const PAGE = 100;

// Collect every pool + amm address from the factory registry (paged).
async function poolAddresses(api) {
  const factory = FACTORY[api.chain];
  const length = Number(await api.call({ target: factory, abi: abi.launchesLength }));
  const owners = [];
  for (let offset = 0; offset < length; offset += PAGE) {
    const rows = await api.call({
      target: factory,
      abi: abi.getLaunches,
      params: [offset, Math.min(PAGE, length - offset)],
    });
    for (const r of rows) {
      if (r.pool) owners.push(r.pool);
      if (r.amm) owners.push(r.amm);
    }
  }
  return owners;
}

// Sum balanceOf(AVLO) over every pool + amm → the AVLO locked in the protocol.
async function tvl(api) {
  const owners = await poolAddresses(api);
  if (owners.length === 0) return {};
  return api.sumTokens({ owners, tokens: [AVLO[api.chain]] });
}

module.exports = {
  methodology:
    "TVL is the AVLO locked across every LuckyLaunch pool: the AVLO raised on each Phase-A bonding-curve presale plus the AVLO reserve of each graduated Phase-B AvaLove DEX pool (x*y=k, LP permanently locked). Launchpad-minted tokens are excluded per DefiLlama convention. Pools are enumerated on-chain from each chain's LuckyFactory (launchesLength + getLaunches).",
  avax: { tvl },
  robinhood: { tvl },
};

/**
 * LuckyLaunch — dual-chain (Avalanche + Robinhood) launchpad + native AMM DEX.
 *
 * Every launch runs two phases, both custodying AVLO (the quote asset):
 *   Phase A — a bonding-curve presale pool that holds the AVLO raised so far.
 *   Phase B — after graduation, a native x*y=k AMM ("AvaLove DEX") whose AVLO
 *             reserve is the pool's liquidity. LP is permanently locked.
 */

const { nullAddress } = require("../helper/tokenMapping");

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
  launches: "function launches(uint256) view returns (address pool, address amm, address token, address creator, string name, string symbol, uint256 createdAt)",
};

async function poolAddresses(api) {
  const launches = await api.fetchList({
    target: FACTORY[api.chain],
    lengthAbi: abi.launchesLength,
    itemAbi: abi.launches,
  });
  return launches
    .flatMap((l) => [l.pool, l.amm])
    .filter((a) => a && a !== nullAddress);
}

async function staking(api) {
  const owners = await poolAddresses(api);
  if (owners.length === 0) return {};
  return api.sumTokens({ owners, tokens: [AVLO[api.chain]] });
}

module.exports = {
  methodology:
    "TVL is the AVLO locked across every LuckyLaunch pool: the AVLO raised on each Phase-A bonding-curve presale plus the AVLO reserve of each graduated Phase-B AvaLove DEX pool (x*y=k, LP permanently locked). Launchpad-minted tokens are excluded per DefiLlama convention. Pools are enumerated on-chain from each chain's LuckyFactory (launchesLength + launches).",
  avax: { tvl: () => ({}), staking },
  robinhood: { tvl: () => ({}), staking },
};

const { getCache } = require('../helper/http');

const chains = {
  ethereum: 1, optimism: 10, cronos: 25, telos: 40, bsc: 56,
  unichain: 130, polygon: 137, monad: 143, sonic: 146, fraxtal: 252,
  pulse: 369, wc: 480, bot: 677, hyperliquid: 999, lisk: 1135,
  metall2: 1750, soneium: 1868, peaq: 3338, tempo: 4217, megaeth: 4326,
  robinhood: 4663, mantle: 5000, arc: 5042, zeta: 7000, base: 8453,
  plasma: 9745, mode: 34443, arbitrum: 42161, celo: 42220, etlk: 42793,
  hemi: 43111, avax: 43114, ink: 57073, linea: 59144, berachain: 80094,
  scroll: 534352, katana: 747474,
};

// The publisher runs every 30 minutes. Allow delayed runs, but not an
// indefinitely retained snapshot after a failed refresh.
const maxSnapshotAge = 2 * 60 * 60 * 1000;
const chainIds = new Set(Object.values(chains));

async function tvl(api, chainId) {
  const stats = await getCache('https://api.vfat.io/v4/sickle-stats');
  const generatedAt = Date.parse(stats?.generatedAt);
  const age = Date.now() - generatedAt;
  if (!Number.isFinite(generatedAt) || age < -5 * 60 * 1000 || age > maxSnapshotAge)
    throw new Error('Missing or stale vfat TVL snapshot');
  if (!Number.isFinite(api.timestamp) || Math.abs(api.timestamp * 1000 - generatedAt) > maxSnapshotAge)
    throw new Error('vfat TVL endpoint does not provide historical balances');
  if (stats.complete !== true || !Array.isArray(stats.expectedChainIds) || !Array.isArray(stats.chainStats))
    throw new Error('Incomplete vfat TVL snapshot');

  const expected = new Set(stats.expectedChainIds);
  if (expected.size !== stats.expectedChainIds.length || expected.size !== chainIds.size ||
      [...expected].some(id => !chainIds.has(id)))
    throw new Error('vfat TVL chain coverage changed; update the adapter');

  const values = new Map();
  for (const row of stats.chainStats) {
    if (!row || !expected.has(row.chainId) || values.has(row.chainId) ||
        !Number.isFinite(row.tvl) || row.tvl < 0)
      throw new Error('Invalid vfat chain TVL');
    values.set(row.chainId, row.tvl);
  }
  if (values.size !== expected.size)
    throw new Error('Missing vfat chain TVL');
  const total = [...values.values()].reduce((sum, value) => sum + value, 0);
  if (!Number.isFinite(stats.tvl) || Math.abs(total - stats.tvl) > 0.01)
    throw new Error('vfat chain TVLs do not reconcile to the snapshot total');

  api.addUSDValue(values.get(chainId));
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'USD value of positions held through Sickle smart wallets, from the existing vfat analytics endpoint.',
};

for (const [chain, chainId] of Object.entries(chains))
  module.exports[chain] = { tvl: api => tvl(api, chainId) };

// fantom is no longer in the API response; keep the export so historical TVL stays in the API
module.exports.fantom = { tvl: () => ({}) };

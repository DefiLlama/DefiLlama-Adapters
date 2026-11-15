const sdk = require('@defillama/sdk');

// Canonical launchpads and deployment blocks: https://hookr.fun/docs/previous-releases
// Verified gen3/4 _graduate/_openPool emit Graduated after initializing the pool; gen4 instant
// launches use the same _openPool. Gen5 _openInstant and bonded _openPool both emit Migrated.
// https://github.com/Hookr-fun/hookr-contracts/tree/3021ef6ae227164a9460d3a7b96e540df3e74633/legacy
const eventFields =
  '(address indexed token,bytes32 indexed poolId,uint160 sqrtPriceX96,' +
  'uint256 ethLiquidity,uint256 tokenLiquidity,uint256 tokensBurned)';
const graduated = `event Graduated${eventFields}`;
const migrated = `event Migrated${eventFields}`;
const launchpads = [
  {
    target: '0xaaed6fab06d53311220f35421dda5cc6d6e9d6c3',
    fromBlock: 27763919,
    eventAbi: graduated,
  },
  {
    target: '0x5ce779d23d2e99d322004f203813389b6a426e3b',
    fromBlock: 33485079,
    eventAbi: graduated,
  },
  {
    target: '0xa043cabe645636899dde91cce4693c00a015e660',
    fromBlock: 41850162,
    eventAbi: migrated,
  },
];
const zeroPool = `0x${'0'.repeat(64)}`;

async function discoverLegacy(api) {
  const toBlock = await api.getBlock();
  const registrations = new Map();
  for (const { target, fromBlock, eventAbi } of launchpads) {
    if (fromBlock > toBlock) continue;
    const logs = await sdk.getEventLogs({
      chain: api.chain,
      targets: [target],
      eventAbi,
      fromBlock,
      toBlock,
      onlyArgs: false,
      flatten: true,
      cacheInCloud: true,
    });
    for (const log of logs) {
      const id = log.args.poolId.toLowerCase();
      if (id === zeroPool) throw new Error('Hookr: legacy pool initialized with zero id');
      // Solidity block.number is the L1-origin block on this L2; stored graduation/migration
      // fields cannot bound RPC logs. This receipt block is the actual PoolManager initialization block.
      const block = Number(log.blockNumber);
      if (!Number.isSafeInteger(block) || block < fromBlock || block > toBlock)
        throw new Error(`Hookr: invalid legacy pool birth block for ${id}`);
      const previous = registrations.get(id);
      if (previous && previous.block !== block)
        throw new Error(`Hookr: conflicting legacy pool birth blocks for ${id}`);
      registrations.set(id, { id, block });
    }
  }
  return [...registrations.values()];
}

module.exports = { discoverLegacy };

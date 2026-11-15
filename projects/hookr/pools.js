const sdk = require('@defillama/sdk');
const { Interface } = require('ethers');
const { chainConfig } = require('../helper/uniswapV4');
const { discoverLegacy } = require('./legacy');

// Published deployments and verified source (including the frozen modular kernels):
// https://hookr.fun/docs/reference/contracts-and-addresses
// https://github.com/Hookr-fun/hookr-contracts/tree/3021ef6ae227164a9460d3a7b96e540df3e74633
const registry = '0x463c82bea1a52f4cc05ca0741a24f0ad24ba4602';
const root = '0x89c9fb50d1f03192230ffb1c279bb6e7d3fe6acc';
const treasury = '0x2242f7fc75606500503075f29ea8cda684efb4a9';
const modularRegistry = '0x5b7f1a117a83aaac15b0698aa4eb9d53fe5f5ba3';
const modularKernels = [
  '0xb3ca29cf721380cee8b8e4755f3865ebc68fe8cc',
  '0xb914f955294799de4b891bd2ea8af628fa1c68cc',
  '0xc7c516cd5546bcb2592fe3f8aa91c2a4ba3768cc',
  '0xa99902a2922014bbe2bf2dcf15742ac5104828cc',
  '0xe5429db8f63912e632e86733905667aaeb6ea8cc',
];

const initialized =
  'event Initialize(bytes32 indexed id,address indexed currency0,address indexed currency1,' +
  'uint24 fee,int24 tickSpacing,address hooks,uint160 sqrtPriceX96,int24 tick)';
const opened =
  'event PoolOpened(bytes32 indexed id,address indexed launcher,bytes32 indexed policyHash,' +
  'address rules,address advisory)';
const stackInitialized =
  'event StackInitialized(bytes32 indexed poolId,bytes32 indexed stackHash,address indexed kernel)';

// Only immutable configuration logs are cached. All state calls use the requested snapshot block.
async function logs(api, targets, eventAbi, fromBlock, extra = {}) {
  const toBlock = await api.getBlock();
  if (fromBlock > toBlock) return [];
  return sdk.getEventLogs({
    chain: api.chain,
    targets,
    eventAbi,
    fromBlock,
    toBlock,
    onlyArgs: false,
    flatten: true,
    cacheInCloud: true,
    ...extra,
  });
}

// Root registrations authenticate the emitter. Immutable Rules then distinguish Hookr's
// treasury-bearing pools from independently operated pools using the permissionless software.
async function currentPools(api) {
  const roots = new Set([root]);
  for (const eventAbi of [
    'event RootRegistered(address indexed root)',
    'event FactoryRootRegistered(address indexed factory,address indexed root)',
    'event OwnedRootRegistered(address indexed root,address indexed factory,address indexed template,address rules)',
  ]) {
    // Registry deployment receipt 0x5e27da36…; root deployment receipt 0x042e3b06….
    for (const log of await logs(api, [registry], eventAbi, 82269732))
      roots.add(log.args.root.toLowerCase());
  }
  const pools = await logs(api, [...roots], opened, 82270270);
  const rules = [...new Set(pools.map((log) => log.args.rules.toLowerCase()))];
  const recipients = rules.length
    ? await api.multiCall({ abi: 'address:protocolRecipient', calls: rules })
    : [];
  const admitted = new Set(
    rules.filter((_, index) => recipients[index].toLowerCase() === treasury)
  );
  return pools
    .filter((log) => admitted.has(log.args.rules.toLowerCase()))
    .map((log) => ({
      id: log.args.id.toLowerCase(),
      block: log.blockNumber,
      hook: log.address.toLowerCase(),
    }));
}

// markInitialized accepts only the configured kernel with its registered code hash. Its
// event is emitted by beforeInitialize in the same transaction as PoolManager.Initialize.
async function modularPools(api) {
  const pools = await logs(api, [modularRegistry], stackInitialized, 57319489);
  return pools
    .filter((log) => modularKernels.includes(log.args.kernel.toLowerCase()))
    .map((log) => ({
      id: log.args.poolId.toLowerCase(),
      block: log.blockNumber,
      hook: log.args.kernel.toLowerCase(),
    }));
}

async function discoverPools(api) {
  const registrations = [
    ...(await discoverLegacy(api)),
    ...(await modularPools(api)),
    ...(await currentPools(api)),
  ];
  const byId = new Map();
  for (const pool of registrations) {
    const previous = byId.get(pool.id);
    if (
      previous &&
      (previous.block !== pool.block || (previous.hook && pool.hook && previous.hook !== pool.hook))
    )
      throw new Error(`Hookr: conflicting registration for ${pool.id}`);
    byId.set(pool.id, pool);
  }

  // Each registration supplies the initialization block. Group nearby births into
  // 100,000-block batches to bound each pool-ID query without scanning unrelated
  // singleton pools or making one request per pool.
  const buckets = new Map();
  for (const pool of byId.values()) {
    const start = Math.floor(pool.block / 100000) * 100000;
    if (!buckets.has(start)) buckets.set(start, []);
    buckets.get(start).push(pool.id);
  }
  const { poolManager } = chainConfig[api.chain];
  const topic = new Interface([initialized]).getEvent('Initialize').topicHash;
  const pools = new Map();
  for (const [fromBlock, ids] of buckets) {
    const toBlock = Math.min(fromBlock + 99999, await api.getBlock());
    const events = await logs(api, [poolManager], initialized, fromBlock, {
      toBlock,
      topics: [topic, ids.sort()],
    });
    for (const log of events) {
      const { id, currency0, currency1, tickSpacing, hooks } = log.args;
      const registration = byId.get(id.toLowerCase());
      if (
        !registration ||
        registration.block !== log.blockNumber ||
        (registration.hook && registration.hook !== hooks.toLowerCase())
      )
        throw new Error(`Hookr: Initialize does not match registration for ${id}`);
      if (Number(tickSpacing) <= 0 || pools.has(id.toLowerCase()))
        throw new Error(`Hookr: invalid or duplicate pool ${id}`);
      pools.set(id.toLowerCase(), {
        id,
        token0: currency0,
        token1: currency1,
        spacing: Number(tickSpacing),
      });
    }
  }
  if (pools.size !== byId.size)
    throw new Error(`Hookr: ${byId.size} registered pools but ${pools.size} Initialize events`);
  return [...pools.values()];
}

module.exports = { discoverPools };

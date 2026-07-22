const ADDRESSES = require("../helper/coreAssets.json");
const { getLogs2 } = require("../helper/cache/getLogs");

// 1inch Aqua (https://github.com/1inch/aqua) is a shared liquidity layer:
// makers keep tokens in their own wallets and grant a revocable ERC20
// allowance to the Aqua registry. Strategies only record virtual balances on
// the registry (ship/dock move no tokens); tokens move solely when a swap
// fills (pull/push). Nothing is ever deposited into protocol contracts, so -
// like Mangrove's promised orderbook liquidity - TVL here is the liquidity
// that swaps can actually pull, not a contract balance.
//
// Pullable liquidity per maker wallet token =
//   min(wallet balance, per-registry min(allowance to registry, sum of live
//   strategies' virtual balances))
// Virtual balances are NOT summed beyond the wallet balance: one wallet
// balance can back many strategies at once, and only what the wallet
// actually holds (and has approved) can be pulled by a swap.

// Both registries are deployed at the same address on every supported chain.
// The protocol redeployed on 2026-07-19 as AquaRouter with an unchanged
// event/storage interface (source verified, e.g.
// https://robinhoodchain.blockscout.com/address/0x1111113CCf1426A8e30e2BFF5e005D929bf6A90A?tab=contract);
// the original developer-release registry still holds live strategies and is
// kept so history stays reproducible.
const OLD_REGISTRY = "0x499943e74fb0ce105688beee8ef2abec5d936d31"; // developer release, 2025-11-17
const NEW_REGISTRY = "0x1111113ccf1426a8e30e2bff5e005d929bf6a90a"; // AquaRouter, 2026-07-19

const PUSHED_ABI =
  "event Pushed(address maker, address app, bytes32 strategyHash, address token, uint256 amount)";
const RAW_BALANCES_ABI =
  "function rawBalances(address maker, address app, bytes32 strategyHash, address token) view returns (uint248 balance, uint8 tokensCount)";
const ALLOWANCE_ABI =
  "function allowance(address owner, address spender) view returns (uint256)";

const DOCKED_SENTINEL = 255;

// chain -> [registry, block just before its deployment on that chain]
const config = {
  ethereum: [
    [OLD_REGISTRY, 23800871],
    [NEW_REGISTRY, 25555859],
  ],
  base: [
    [OLD_REGISTRY, 38187727],
    [NEW_REGISTRY, 48771727],
  ],
  optimism: [
    [OLD_REGISTRY, 143783012],
    [NEW_REGISTRY, 154367012],
  ],
  polygon: [
    [OLD_REGISTRY, 79029890],
    [NEW_REGISTRY, 90418535],
  ],
  arbitrum: [
    [OLD_REGISTRY, 400333080],
    [NEW_REGISTRY, 484967779],
  ],
  avax: [
    [OLD_REGISTRY, 71974607],
    [NEW_REGISTRY, 90579137],
  ],
  bsc: [
    [OLD_REGISTRY, 68218281],
    [NEW_REGISTRY, 110607518],
  ],
  xdai: [
    [OLD_REGISTRY, 43148907],
    [NEW_REGISTRY, 47257185],
  ],
  linea: [
    [OLD_REGISTRY, 25662484],
    [NEW_REGISTRY, 31418431],
  ],
  sonic: [
    [OLD_REGISTRY, 55302991],
    [NEW_REGISTRY, 76114316],
  ],
  unichain: [
    [OLD_REGISTRY, 32416441],
    [NEW_REGISTRY, 53584441],
  ],
  era: [
    [OLD_REGISTRY, 66244013],
    [NEW_REGISTRY, 71209736],
  ],
  robinhood: [[NEW_REGISTRY, 13888204]],
};

function minBigInt(...values) {
  return values.reduce((min, value) => (value < min ? value : min));
}

// ship() accepts arbitrary token addresses, so a maker can register a
// strategy with a junk token whose balanceOf/allowance always reverts -
// failing the whole refill on that would let anyone permanently break the
// adapter. Such tokens are unpullable (safeTransferFrom would revert too),
// so 0 is their correct contribution. Transient RPC failures, however, must
// not silently undercount a refill: retry failed reads once and only treat
// what still fails as junk.
async function retryFailedReads(api, { abi, calls, results }) {
  const failedIndexes = results
    .map((value, index) => (value === null || value === undefined ? index : -1))
    .filter((index) => index !== -1);
  if (!failedIndexes.length) return;

  const retried = await api.multiCall({
    abi,
    calls: failedIndexes.map((index) => calls[index]),
    permitFailure: true,
  });
  retried.forEach((value, position) => {
    if (value !== null && value !== undefined)
      results[failedIndexes[position]] = value;
  });
}

async function tvl(api) {
  // Every (maker, app, strategyHash, token) tuple ever registered appears in
  // Pushed logs: ship() emits one Pushed per strategy token, and push() only
  // accepts tokens already active in a strategy. rawBalances() then gives
  // both liveness (tokensCount: 0xff = docked) and the current virtual
  // balance, so Shipped/Docked logs are not needed at all.
  const tuples = new Map();
  for (const [registry, fromBlock] of config[api.chain]) {
    const logs = await getLogs2({
      api,
      target: registry,
      eventAbi: PUSHED_ABI,
      fromBlock,
    });
    for (const log of logs) {
      const maker = log.maker.toLowerCase();
      const app = log.app.toLowerCase();
      const strategyHash = log.strategyHash.toLowerCase();
      const token = log.token.toLowerCase();
      if (token === ADDRESSES.null || token === ADDRESSES.GAS_TOKEN_2) continue;
      tuples.set(`${registry}-${maker}-${app}-${strategyHash}-${token}`, {
        registry,
        maker,
        app,
        strategyHash,
        token,
      });
    }
  }
  const strategyTokens = [...tuples.values()];
  if (!strategyTokens.length) return;

  const rawBalances = await api.multiCall({
    abi: RAW_BALANCES_ABI,
    calls: strategyTokens.map((i) => ({
      target: i.registry,
      params: [i.maker, i.app, i.strategyHash, i.token],
    })),
  });

  // (maker, token, registry) -> sum of live strategies' virtual balances
  const virtualByMakerTokenRegistry = new Map();
  strategyTokens.forEach(({ registry, maker, token }, index) => {
    const result = rawBalances[index];
    const tokensCount = Number(result.tokensCount ?? result[1]);
    if (!tokensCount || tokensCount === DOCKED_SENTINEL) return;
    const key = `${maker}-${token}-${registry}`;
    const balance = BigInt(result.balance ?? result[0]);
    virtualByMakerTokenRegistry.set(
      key,
      (virtualByMakerTokenRegistry.get(key) ?? 0n) + balance,
    );
  });
  if (!virtualByMakerTokenRegistry.size) return;

  // wallet balances per unique (maker, token), allowances per (maker, token, registry)
  const walletPairs = new Map();
  const allowanceCalls = [];
  for (const key of virtualByMakerTokenRegistry.keys()) {
    const [maker, token, registry] = key.split("-");
    walletPairs.set(`${maker}-${token}`, { maker, token });
    allowanceCalls.push({ key, target: token, params: [maker, registry] });
  }
  const walletPairList = [...walletPairs.values()];
  const balanceOfCalls = walletPairList.map((i) => ({
    target: i.token,
    params: [i.maker],
  }));
  const allowanceCallParams = allowanceCalls.map((i) => ({
    target: i.target,
    params: i.params,
  }));

  const [walletBalances, allowances] = await Promise.all([
    api.multiCall({
      abi: "erc20:balanceOf",
      calls: balanceOfCalls,
      permitFailure: true,
    }),
    api.multiCall({
      abi: ALLOWANCE_ABI,
      calls: allowanceCallParams,
      permitFailure: true,
    }),
  ]);
  await retryFailedReads(api, {
    abi: "erc20:balanceOf",
    calls: balanceOfCalls,
    results: walletBalances,
  });
  await retryFailedReads(api, {
    abi: ALLOWANCE_ABI,
    calls: allowanceCallParams,
    results: allowances,
  });

  // per (maker, token): registry capacity = min(allowance, virtual sum);
  // pullable = min(wallet balance, sum of registry capacities)
  const capacityByMakerToken = new Map();
  allowanceCalls.forEach(({ key }, index) => {
    if (allowances[index] === null || allowances[index] === undefined) return;
    const [maker, token] = key.split("-");
    const capacity = minBigInt(
      BigInt(allowances[index]),
      virtualByMakerTokenRegistry.get(key),
    );
    const pairKey = `${maker}-${token}`;
    capacityByMakerToken.set(
      pairKey,
      (capacityByMakerToken.get(pairKey) ?? 0n) + capacity,
    );
  });

  walletPairList.forEach(({ maker, token }, index) => {
    if (walletBalances[index] === null || walletBalances[index] === undefined)
      return;
    const capacity = capacityByMakerToken.get(`${maker}-${token}`) ?? 0n;
    const pullable = minBigInt(BigInt(walletBalances[index]), capacity);
    if (pullable > 0n) api.add(token, pullable.toString());
  });
}

module.exports = {
  methodology:
    "Counts the shared liquidity that Aqua strategies can actually pull at swap time. Aqua is non-custodial: makers never deposit, tokens stay in the maker wallet and the registry only holds a revocable allowance plus per-strategy virtual balances. For each maker wallet token backing at least one live (shipped, not docked) strategy, the adapter counts min(wallet balance, allowance granted to the registry, sum of live strategies virtual balances) - once per wallet token, so liquidity shared across many strategies is never double counted and idle wallet funds beyond what strategies quote are excluded.",
  start: "2025-11-17", // Aqua developer release: https://blog.1inch.com/aqua-developer-release/
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});

const ACCOUNT_MANAGERS = {
  scroll: '0x2E70d2778d143412D66Edf835Be82DB29CB1ECfB',
  base: '0x69c01ED80d5949E222d5638BA44373D3DCF0A4e7',
  arbitrum: '0x0e9aA7015773785c1A9dB9d2a8756c952BE096Cf',
  avax: '0x9673FcfeDbb6C83c4a76f81Bcadf0fc8535EA9C5',
  optimism: '0x95CECcd40D98de57F0d93E659e1c966b11A1fb06',
};

const ROUTER_MANAGERS = {
  scroll: '0xFc309ed1FaCd18E942E3a245964D4F94fB4953F9',
  base: '0x7b8af9525F0183909eA985798D415422d875D93d',
  arbitrum: '0x92BF97347ea2037eC8E4b3762B7cCEB8017C255D',
  avax: '0x4793281C20966e39DF90DE21624FF7C3Bb88dDb3',
  optimism: '0x38Ba8BA3002A1D1984De2ec511D3C9Ffb3F4Ce26',
};

const CHAIN_IDS = {
  scroll: 534352,
  base: 8453,
  arbitrum: 42161,
  avax: 43114,
  optimism: 10,
};

// RouterManager deployment block per chain — the exact block at which the
// contract was deployed (sourced from Foundry broadcast receipts). Used as the
// fromBlock for StrategySet event discovery so we never scan empty history.
const ROUTER_FROM_BLOCK = {
  scroll: 33249798,
  base: 45220682,
  arbitrum: 456890272,
  avax: 84018854,
  optimism: 150849515,
};

const ZERO = '0x0000000000000000000000000000000000000000';
const PAGE_SIZE = 500;

const routerMgrAbi = {
  getAllProtocols: 'function getAllProtocols() view returns (string[])',
  getRouter: 'function getRouter(string protocol) view returns (address)',
};

const accountMgrAbi = {
  count: 'function getAccountCount() view returns (uint256)',
  at: 'function getAccountAtIndex(uint256) view returns (address)',
  whitelistedCount: 'function getWhitelistedTokenCount() view returns (uint256)',
  whitelisted: 'function getWhitelistedTokens(uint256 offset, uint256 limit) view returns (address[])',
};

const routerAbi = {
  strategySetEvent:
    'event StrategySet(bytes32 indexed id, string name, uint32 chainId, address composer, bool enabled)',
  getStrategy:
    'function getStrategy(bytes32 id) view returns (tuple(string name, address vaultAddress, address assetToken, address shareToken, address bridgeModule, address vaultModule, uint32 chainId, bool enabled, uint256 minDeposit))',
};

// Discover the set of share tokens whose underlying liquidity actually lives on
// THIS chain. Source of truth: on-chain Router.getStrategy() filtered to local
// strategies (bridgeModule == 0x0). Cross-chain entries on a source-chain Router
// reference vaults on other chains — those are counted on those other chains.
async function discoverLocalShareTokens(api) {
  const chain = api.chain;
  const routerManager = ROUTER_MANAGERS[chain];
  const currentChainId = CHAIN_IDS[chain];
  if (!routerManager) return [];

  let protocols;
  try {
    protocols = await api.call({ target: routerManager, abi: routerMgrAbi.getAllProtocols });
  } catch (e) {
    return [];
  }
  if (!protocols || !protocols.length) return [];

  const routers = await api.multiCall({
    abi: routerMgrAbi.getRouter,
    calls: protocols.map((p) => ({ target: routerManager, params: [p] })),
    permitFailure: true,
  });
  const validRouters = routers.filter((r) => r && r.toLowerCase() !== ZERO);
  if (!validRouters.length) return [];

  const fromBlock = ROUTER_FROM_BLOCK[chain] || 0;
  const logsByRouter = await Promise.all(
    validRouters.map(async (router) => {
      try {
        const logs = await api.getLogs({
          target: router,
          eventAbi: routerAbi.strategySetEvent,
          onlyArgs: true,
          fromBlock,
        });
        return { router, logs };
      } catch (e) {
        return { router, logs: [] };
      }
    }),
  );

  const seen = new Set();
  const pairs = [];
  for (const { router, logs } of logsByRouter) {
    for (const log of logs) {
      const id = log.id;
      const key = `${router.toLowerCase()}-${id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push({ router, id });
    }
  }
  if (!pairs.length) return [];

  const strategies = await api.multiCall({
    abi: routerAbi.getStrategy,
    calls: pairs.map((p) => ({ target: p.router, params: [p.id] })),
    permitFailure: true,
  });

  const shareTokens = new Set();
  for (const s of strategies) {
    if (!s) continue;
    if (Number(s.chainId) !== currentChainId) continue; // cross-chain: vault not on this chain
    if (s.bridgeModule && s.bridgeModule.toLowerCase() !== ZERO) continue;
    if (!s.shareToken || s.shareToken.toLowerCase() === ZERO) continue;
    shareTokens.add(s.shareToken.toLowerCase());
  }
  return Array.from(shareTokens);
}

async function tvl(api) {
  const chain = api.chain;
  const accountManager = ACCOUNT_MANAGERS[chain];
  if (!accountManager) return;

  // 1. Enumerate every Account proxy on this chain. Bail cleanly at historical
  //    blocks where AccountManager isn't deployed yet.
  let count;
  try {
    count = Number(await api.call({ target: accountManager, abi: accountMgrAbi.count }));
  } catch (e) {
    return;
  }
  if (!count) return;

  const accounts = [];
  for (let offset = 0; offset < count; offset += PAGE_SIZE) {
    const pageLen = Math.min(PAGE_SIZE, count - offset);
    const page = await api.multiCall({
      target: accountManager,
      abi: accountMgrAbi.at,
      calls: Array.from({ length: pageLen }, (_, i) => offset + i),
    });
    accounts.push(...page);
  }

  // 2. Whitelisted asset tokens (idle balances live in the Account itself).
  let whitelistedCount = 0;
  try {
    whitelistedCount = Number(
      await api.call({ target: accountManager, abi: accountMgrAbi.whitelistedCount }),
    );
  } catch (e) {
    whitelistedCount = 0;
  }
  let whitelistedTokens = [];
  if (whitelistedCount > 0) {
    try {
      for (let offset = 0; offset < whitelistedCount; offset += PAGE_SIZE) {
        const pageLen = Math.min(PAGE_SIZE, whitelistedCount - offset);
        const page = await api.call({
          target: accountManager,
          abi: accountMgrAbi.whitelisted,
          params: [offset, pageLen],
        });
        whitelistedTokens.push(...page);
      }
    } catch (e) {
      whitelistedTokens = [];
    }
  }

  // 3. Strategy share tokens — discovered on-chain from RouterManager + Router events.
  const shareTokens = await discoverLocalShareTokens(api);

  // 4. Idle balances: balanceOf(whitelistedToken) summed across Accounts, added at face value.
  if (whitelistedTokens.length && accounts.length) {
    const calls = [];
    for (const account of accounts) {
      for (const token of whitelistedTokens) {
        calls.push({ target: token, params: [account] });
      }
    }
    const balances = await api.multiCall({
      abi: 'erc20:balanceOf',
      calls,
      permitFailure: true,
    });
    for (let i = 0; i < calls.length; i++) {
      const bal = balances[i];
      if (bal && bal !== '0') api.add(calls[i].target, bal);
    }
  }

  // 5. Strategy positions: balanceOf(shareToken) per Account, summed per share,
  //    converted to underlying via ERC4626.convertToAssets(). Disabled strategies
  //    are intentionally counted — users can still withdraw from them.
  if (shareTokens.length && accounts.length) {
    const calls = [];
    for (const shareToken of shareTokens) {
      for (const account of accounts) {
        calls.push({ target: shareToken, params: [account] });
      }
    }
    const balances = await api.multiCall({
      abi: 'erc20:balanceOf',
      calls,
      permitFailure: true,
    });

    const sumByShare = {};
    for (let i = 0; i < calls.length; i++) {
      const bal = balances[i];
      if (!bal || bal === '0') continue;
      const t = calls[i].target;
      sumByShare[t] = (sumByShare[t] || 0n) + BigInt(bal);
    }

    const sharesWithBalance = Object.keys(sumByShare);
    if (sharesWithBalance.length) {
      const [underlyings, assetAmounts] = await Promise.all([
        api.multiCall({
          abi: 'address:asset',
          calls: sharesWithBalance,
          permitFailure: true,
        }),
        api.multiCall({
          abi: 'function convertToAssets(uint256) view returns (uint256)',
          calls: sharesWithBalance.map((t) => ({ target: t, params: [sumByShare[t].toString()] })),
          permitFailure: true,
        }),
      ]);

      for (let i = 0; i < sharesWithBalance.length; i++) {
        const underlying = underlyings[i];
        const assets = assetAmounts[i];
        if (!underlying || !assets || assets === '0') continue;
        api.add(underlying, assets);
      }
    }
  }
}

const exportObj = {
  doublecounted: true,
  start: '2025-09-01',
  methodology:
    'TVL is the sum of underlying assets represented by ERC-4626 vault shares held by Bundie user Account proxies on each chain, plus idle whitelisted assets (USDC) sitting in those Accounts. Strategies are discovered on-chain by enumerating RouterManager.getAllProtocols(), reading StrategySet events on each ProtocolRouter, and filtering to local strategies via Router.getStrategy().bridgeModule == 0x0. Share-to-asset conversion uses ERC4626.convertToAssets at the queried block. Disabled strategies are still counted because users retain withdrawal rights on them.',
};

for (const chain of Object.keys(ACCOUNT_MANAGERS)) {
  exportObj[chain] = { tvl };
}

module.exports = exportObj;

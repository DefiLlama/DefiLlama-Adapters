const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  scroll: {
    accountManager: '0x2E70d2778d143412D66Edf835Be82DB29CB1ECfB',
    routerManager: '0xFc309ed1FaCd18E942E3a245964D4F94fB4953F9',
    routeFromBlock: 33249798,
  },
  base: {
    accountManager: '0x69c01ED80d5949E222d5638BA44373D3DCF0A4e7',
    routerManager: '0x7b8af9525F0183909eA985798D415422d875D93d',
    routeFromBlock: 45220682,
  },
  arbitrum: {
    accountManager: '0x0e9aA7015773785c1A9dB9d2a8756c952BE096Cf',
    routerManager: '0x92BF97347ea2037eC8E4b3762B7cCEB8017C255D',
    routeFromBlock: 456890272,
  },
  avax: {
    accountManager: '0x9673FcfeDbb6C83c4a76f81Bcadf0fc8535EA9C5',
    routerManager: '0x4793281C20966e39DF90DE21624FF7C3Bb88dDb3',
    routeFromBlock: 84018854,
  },
  optimism: {
    accountManager: '0x95CECcd40D98de57F0d93E659e1c966b11A1fb06',
    routerManager: '0x38Ba8BA3002A1D1984De2ec511D3C9Ffb3F4Ce26',
    routeFromBlock: 150849515,
  },
};

const routerMgrAbi = {
  getAllProtocols: 'function getAllProtocols() view returns (string[])',
  getRouter: 'function getRouter(string protocol) view returns (address)',
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
  const { routerManager, routeFromBlock: fromBlock } = config[api.chain];


  let protocols = await api.call({ target: routerManager, abi: routerMgrAbi.getAllProtocols });
  const routers = await api.multiCall({ abi: routerMgrAbi.getRouter, calls: protocols.map((p) => ({ params: [p] })), target: routerManager })
  const strategyCalls = [];

  for (const r of routers) {
    if (r.toLowerCase() === ADDRESSES.null) continue;
    const logs = await getLogs2({ api, target: r, eventAbi: routerAbi.strategySetEvent, fromBlock, });
    const ids = logs.map((log) => log.id)
    const uniqueIds = [...new Set(ids)]
    for (const id of uniqueIds) {
      strategyCalls.push({ target: r, params: [id] });
    }
  }

  const strategies = await api.multiCall({    abi: routerAbi.getStrategy,    calls: strategyCalls, excludeFailed: true,  });

  const shareTokens = new Set();
  for (const s of strategies) {
    if (!s) continue;
    if (Number(s.chainId) !== api.chainId) continue; // cross-chain: vault not on this chain
    if (s.bridgeModule && s.bridgeModule.toLowerCase() !== ADDRESSES.null) continue;
    if (!s.shareToken || s.shareToken.toLowerCase() === ADDRESSES.null) continue;
    shareTokens.add(s.shareToken.toLowerCase());
  }
  return Array.from(shareTokens);
}

async function tvl(api) {
  const { accountManager, } = config[api.chain];
  const accounts = await api.fetchList({ lengthAbi: 'getAccountCount', itemAbi: 'getAccountAtIndex', target: accountManager })
  const whitelistedTokens = await api.fetchList({ lengthAbi: 'getWhitelistedTokenCount', itemAbi: 'whitelistedTokenList', target: accountManager })
  // add plain tokens on accounts
  await api.sumTokens({ tokens:whitelistedTokens, owners: accounts })

  // 3. Strategy share tokens — discovered on-chain from RouterManager + Router events.
  const shareTokens = await discoverLocalShareTokens(api);

  const allShareTokenBalances = await api.getTokenBalances({ tokens:shareTokens, owners: accounts, withTokenData: true, })
  let stBalMap = {}
  for (const b of allShareTokenBalances) {
    if (!b.balance || b.balance === '0') continue;
    stBalMap[b.token] = new BigNumber(stBalMap[b.token]) ?? new BigNumber(0)
    stBalMap[b.token] = stBalMap[b.token].plus(b.balance)
    stBalMap[b.token] = stBalMap[b.token].toFixed(0)
  }
  const shareTokenBalances = Object.entries(stBalMap)
  const uAssets = await api.multiCall({  abi: 'address:asset', calls: shareTokenBalances.map(([t]) => ({ target: t })) })
  const uBals = await api.multiCall({  abi: 'function convertToAssets(uint256) view returns (uint256)', calls: shareTokenBalances.map(([t, bals]) => ({ target: t, params: [bals] })) })

  api.add(uAssets, uBals)
}

module.exports = {
  doublecounted: true,
  start: '2025-09-01',
  methodology:
    'TVL is the sum of underlying assets represented by ERC-4626 vault shares held by Bundie user Account proxies on each chain, plus idle whitelisted assets (USDC) sitting in those Accounts. Strategies are discovered on-chain by enumerating RouterManager.getAllProtocols(), reading StrategySet events on each ProtocolRouter, and filtering to local strategies via Router.getStrategy().bridgeModule == 0x0. Share-to-asset conversion uses ERC4626.convertToAssets at the queried block. Disabled strategies are still counted because users retain withdrawal rights on them.',
};

for (const chain of Object.keys(config))
  module.exports[chain] = { tvl };



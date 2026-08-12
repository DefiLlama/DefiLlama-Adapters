const { sumERC4626VaultsExport2 } = require('../helper/erc4626');
const { getLogs } = require('../helper/cache/getLogs');
const { sumTokens2 } = require('../helper/unwrapLPs');

const RESONATE_DEFAULT = '0x80ca847618030bc3e26ad2c444fd007279daf50a';

const config = {
  ethereum: { fromBlock: 15669717, },
  optimism: { fromBlock: 26379632, },
  arbitrum: { fromBlock: 27506229, },
  polygon: { fromBlock: 33740852, RESONATE: '0x6ECB87A158c41d21c82C65B2D8a67Ea435804f64', },
}

const eventAbis = {
  PoolCreated: 'event PoolCreated(bytes32 indexed poolId, address indexed asset, address indexed vault, address payoutAsset, uint128 rate, uint128 addInterestRate, uint32 lockupPeriod, uint256 packetSize, bool isFixedTerm, string poolName, address creator)',
  CapitalActivated: 'event CapitalActivated(bytes32 indexed poolId, uint256 numPackets, uint256 indexed principalFNFT)',
};

async function tvl(api) {
  const { RESONATE = RESONATE_DEFAULT, fromBlock } = config[api.chain];

  const RESONATE_HELPER = await api.call({ abi: 'address:RESONATE_HELPER', target: RESONATE })

  const poolLogs = await getLogs({
    api,
    target: RESONATE,
    eventAbi: eventAbis.PoolCreated,
    onlyArgs: true,
    fromBlock,
    onlyUseExistingCache: true,
  });
  const activatedLogs = await getLogs({
    api,
    target: RESONATE,
    eventAbi: eventAbis.CapitalActivated,
    onlyArgs: true,
    fromBlock,
    extraKey: 'CapitalActivated',
    onlyUseExistingCache: true,
  });

  const poolIds = poolLogs.map(l => l.poolId);
  const assets = poolLogs.map(l => l.asset);
  const fnftIds = activatedLogs.map(l => l.principalFNFT.toString());

  const poolInfo = await api.multiCall({
    target: RESONATE,
    abi: 'function pools(bytes32) view returns (address asset, address vault, address adapter, uint32 lockupPeriod, uint128 rate, uint128 addInterestRate, uint256 packetSize)',
    calls: poolIds,
  });
  const poolAdapters = poolInfo.map(p => p[2]);
  if (api.chain !== 'ethereum') {
    await sumERC4626VaultsExport2({ vaults: poolAdapters, permitFailure: true })(api)
    return sumTokens2({ api, resolveLP: true, })
  }


  const poolWallets = await api.multiCall({
    target: RESONATE_HELPER,
    abi: 'function getAddressForPool(bytes32) view returns (address)',
    calls: poolIds,
    permitFailure: true,
  });

  const fnftWallets = fnftIds.length
    ? await api.multiCall({
      target: RESONATE_HELPER,
      abi: 'function getAddressForFNFT(bytes32) view returns (address)',
      calls: fnftIds.map(id => '0x' + BigInt(id).toString(16).padStart(64, '0')),
      permitFailure: true,
    })
    : [];

  const fnftPoolIdx = {};
  poolIds.forEach((p, i) => { fnftPoolIdx[p] = i; });

  const assetBalCalls = poolWallets.map((w, i) => ({ target: assets[i], params: [w] }));
  const adapterBalCalls = poolWallets.map((w, i) => ({ target: poolAdapters[i], params: [w] }));

  const fnftAdapterCalls = fnftWallets.map((w, idx) => {
    const pid = activatedLogs[idx].poolId;
    const i = fnftPoolIdx[pid];
    return { target: poolAdapters[i], params: [w] };
  });

  const balanceAbi = 'function balanceOf(address) view returns (uint256)';
  const [assetBals, adapterBals, fnftAdapterBals] = await Promise.all([
    api.multiCall({ abi: balanceAbi, calls: assetBalCalls, permitFailure: true }),
    api.multiCall({ abi: balanceAbi, calls: adapterBalCalls, permitFailure: true }),
    api.multiCall({ abi: balanceAbi, calls: fnftAdapterCalls, permitFailure: true }),
  ]);

  const sharesByAdapter = {};
  adapterBals.forEach((bal, i) => {
    if (!bal || bal === '0') return;
    const a = poolAdapters[i];
    sharesByAdapter[a] = (sharesByAdapter[a] || 0n) + BigInt(bal);
  });
  fnftAdapterBals.forEach((bal, idx) => {
    if (!bal || bal === '0') return;
    const pid = activatedLogs[idx].poolId;
    const i = fnftPoolIdx[pid];
    const a = poolAdapters[i];
    sharesByAdapter[a] = (sharesByAdapter[a] || 0n) + BigInt(bal);
  });

  const adapterAddrs = Object.keys(sharesByAdapter);
  const assetsFromShares = await api.multiCall({
    abi: 'function convertToAssets(uint256) view returns (uint256)',
    calls: adapterAddrs.map(a => ({ target: a, params: [sharesByAdapter[a].toString()] })),
    permitFailure: true,
  });

  const adapterAsset = {};
  poolIds.forEach((_, i) => { adapterAsset[poolAdapters[i]] = assets[i]; });

  assetBals.forEach((bal, i) => {
    if (bal) api.add(assets[i], bal);
  });
  adapterAddrs.forEach((a, i) => {
    if (assetsFromShares[i]) api.add(adapterAsset[a], assetsFromShares[i]);
  });
}

module.exports = {
  methodology: "We sum all the tokens deposited as principal and any unclaimed interest accrued on it.",
  hallmarks: [
    ['2023-04-25', "Launch of Regen Portal"],
    ['2023-06-20', "Launch of Frax Portal"]
  ],
};

Object.keys(config).forEach(chain => module.exports[chain] = { tvl })
module.exports.fantom = { tvl: () => ({}) }
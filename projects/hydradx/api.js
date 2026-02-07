const sdk = require('@defillama/sdk')
const { ApiPromise, WsProvider } = require("@polkadot/api")

// Omnipool constants
const omnipoolAccountId = "7L53bUTBbfuj14UpdCNPwmgzzHSsrsTWBHX5pys32mVWM3C1"
const stablepoolAccountId = "7JP6TvcH5x31TsbC6qVJHEhsW7UNmpREMZuLBpK2bG1goJRS"
const stablepoolAccountId2 = "7MaKPwwnqN4cqg35PbxsGXUo1dfvjXQ3XfBjWF9UVvKMjJj8"
const stablepoolAccountId3 = "7LVGEVLFXpsCCtnsvhzkSMQARU7gRVCtwMckG7u7d3V6FVvG"
const stablepoolAccountId4 = "167UdiHenqFRAFeb8GxRYGT89BpKi2VPDnUjDFT8H8efqueB"

const cgMapping = {
  DAI: 'dai',
  INTR: 'interlay',
  GLMR: 'moonbeam',
  vDOT: 'voucher-dot',
  ZTG: 'zeitgeist',
  CFG: 'centrifuge',
  BNC: 'bifrost-native-coin',
  WETH: 'ethereum',
  DOT: 'polkadot',
  APE: 'apecoin',
  USDC: 'usd-coin',
  USDT: 'tether',
  ASTR: 'astar',
  WBTC: 'wrapped-bitcoin',
  iBTC: 'interbtc',
  HDX: 'hydradx',
  tBTC: 'tbtc',
  AAVE: 'aave',
  PHA: 'pha',
  vASTR: 'bifrost-voucher-astr',
  KSM: 'kusama',
  KILT: 'kilt-protocol',
  SKY: 'sky',
  LINK: 'chainlink',
  SOL: 'solana',
  CRU: 'crust-network',
  RING: 'darwinia-network-native-token',
  EWT: 'energy-web-token',
  UNQ: 'unique-network',
  MYTH: 'mythos',
  WUD: 'gawun-wud',
  // GDOT: 'gigadot' // skip for doublecount 
};

const RAW_STATIC_XYK_POOL_DATA = [
  [["15L6BQ1sMd9pESapK13dHaXBPPtBYnDnKTVhb2gBeGrrJNBx"], [30, 5]], // DOT/MYTH
  [["15BuQdFibo2wZmwksPWCJ3owmXCduSU56gaXzVKDc1pcCcsd"], [1000085, 5]], // WUD/DOT
  [["15nzS2D2wJdh52tqZdUJVMeDQqQe7wJfo5NZKL7pUxhwYgwq"], [5, 252525]],  // DOT/EWT
  [["15sjxrJkJRCXs64J7wvxNE3vjJ8CGjDPggqeNwEyijvydwri"], [5, 25]],      // DOT/UNQ
  [["12NzWeY2eDLRbdmjUunmLVE3TBnkgFGy3SCFH2hmDbhLs8qB"], [1000082, 5]]  // WIFD/DOT
];

async function omnipoolTvl(api) {
  const provider = new WsProvider("wss://rpc.hydradx.cloud");
  const polkadotApi = await ApiPromise.create({ provider });
  await polkadotApi.isReady;

  const processedAssetMetadata = [];
  // Use assets.entries() to fetch all registered assets robustly
  const allAssets = await polkadotApi.query.assetRegistry.assets.entries()

  for (const [key, metaOpt] of allAssets) {
    if (metaOpt.isSome) {
      const meta = metaOpt.unwrap()
      // Extract assetId from the storage key
      // The exact method might vary slightly based on key structure, .args[0] is common
      const assetIdFromKey = key.args[0].toNumber()

      if (assetIdFromKey !== 0) { // Skip asset 0 (HDX) as it's handled separately
        processedAssetMetadata.push({
          assetId: assetIdFromKey,
          symbol: meta.symbol.toHuman(),
          decimals: +meta.decimals,
        })
      }
    }
  }

  // Handle HDX (asset ID 0) separately
  const hdxBalance = await polkadotApi.query.system.account(omnipoolAccountId)
  add('hydradx', hdxBalance.data.free / 1e12) // Assuming HDX decimals is 12

  for (const { decimals, assetId, symbol } of processedAssetMetadata) {
    const cgId = cgMapping[symbol]
    if (cgId) {
      if (symbol === 'GDOT') {
        const issuance = await polkadotApi.query.tokens.totalIssuance(assetId)
        add(cgId, Number(issuance) / (10 ** decimals))
      } else {
        const bals = await Promise.all([omnipoolAccountId, stablepoolAccountId, stablepoolAccountId2, stablepoolAccountId3].map(accId =>
          polkadotApi.query.tokens.accounts(accId, assetId)
        ))
        const total = bals.reduce((acc, bal) => acc + Number(bal.free), 0) / (10 ** decimals)
        add(cgId, total)
      }
    }
  }

  // Process balances for the gdot stablepool
  const gdotStablePoolAssets = [
    { id: 15, cgKey: 'vDOT' },    // Asset ID 15 is vDOT
    { id: 1001, cgKey: 'DOT' },   // Asset ID 1001 is aDOT, treat as DOT for Coingecko
  ];

  for (const asset of gdotStablePoolAssets) {
    const balanceData = await polkadotApi.call.currenciesApi.account(asset.id, stablepoolAccountId4);
    const freeBalance = balanceData.free.toBigInt();

    if (freeBalance > 0n) {
      const cgId = cgMapping[asset.cgKey];
      const meta = processedAssetMetadata.find(m => m.assetId === asset.id);

      if (cgId && meta && typeof meta.decimals === 'number' && !isNaN(meta.decimals)) {
        const readableBalance = Number(freeBalance) / (10 ** meta.decimals);
        add(cgId, readableBalance);
      } else {
        console.warn(`HydraDX: Could not find Coingecko ID or metadata for asset ${asset.id} (${asset.cgKey}) in new stablepool.`);
      }
    }
  }

  // Add XYK Pool TVL using the refined static list
  const staticXykPools = RAW_STATIC_XYK_POOL_DATA.map(entry => {
    // Basic validation for the entry structure
    if (!entry || !entry[0] || !entry[0][0] || !entry[1] || typeof entry[1][0] === 'undefined' || typeof entry[1][1] === 'undefined') {
      return null;
    }
    return {
      poolAccountId: entry[0][0],
      assetIdA: entry[1][0],
      assetIdB: entry[1][1],
    };
  }).filter(p => p !== null);

  try {
    for (const { poolAccountId, assetIdA, assetIdB } of staticXykPools) {
      for (const assetId of [assetIdA, assetIdB]) {
        if (typeof assetId !== 'number') {
          continue;
        }
        const tokenInfo = await polkadotApi.query.assetRegistry.assets(assetId);
        if (!tokenInfo.isSome) {
          continue;
        }
        const decimals = +tokenInfo.unwrap().decimals;
        const rawSymbol = tokenInfo.unwrap().symbol;
        const symbol = rawSymbol.isSome ? rawSymbol.unwrap().toUtf8() : null;

        if (!symbol) {
          continue;
        }

        const coingeckoId = cgMapping[symbol];
        if (!coingeckoId) {
          continue;
        }

        const balanceEntry = await polkadotApi.query.tokens.accounts(poolAccountId, assetId);
        const balance = balanceEntry.free.toBigInt();

        if (balance > 0n) {
          const readableBalance = Number(balance) / (10 ** decimals);
          add(coingeckoId, readableBalance);
        }
      }
    }
  } catch (error) {
    console.error("Error fetching or processing XYK pool TVL from static list:", error);
  }

  await polkadotApi.disconnect();
  return api.getBalances();

  function add(token, bal) {
    api.add(token, bal, { skipChain: true });
  }
}

module.exports = {
  hydradx: { tvl: omnipoolTvl },
}
// Bounce - Leveraged Tokens on HyperEVM
// TVL = sum of totalAssets() across all LeveragedToken contracts
// totalAssets() = baseAssetBalance (HyperEVM) + blockBridging (in-flight) + hyperliquidUsdc (HyperCore idle asset and perp margin)
//
// Contract resolution chain:
//   GlobalStorage.factory()      → Factory address
//   GlobalStorage.baseAsset()    → Base asset address used by all Leveraged Tokens
//   Factory.lts()                → All deployed LeveragedToken addresses
//   LeveragedToken.totalAssets() → TVL per token

// GlobalStorage: Config contract holding protocol addresses and parameters
const GLOBAL_STORAGE = '0xa07d06383c1863c8A54d427aC890643d76cc03ff';

async function tvl(api) {
  const [factory, baseAsset] = await Promise.all([
    api.call({ abi: 'address:factory', target: GLOBAL_STORAGE }),
    api.call({ abi: 'address:baseAsset', target: GLOBAL_STORAGE }),
  ]);

  const lts = await api.call({ abi: 'address[]:lts', target: factory });

  const assets = await api.multiCall({ abi: 'uint256:totalAssets', calls: lts });
  assets.forEach(amount => api.add(baseAsset, amount));
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the sum of base asset (USDC) backing all leveraged tokens, including assets held on HyperEVM, in-flight during bridging, idle assets on HyperCore, and assets deployed as margin in HyperCore perpetual positions.',
  hyperliquid: { tvl },
};

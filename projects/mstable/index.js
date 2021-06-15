const sdk = require('@defillama/sdk');

const MASSET_ABI_V2 = require('./abi-massetv2.json');

const ASSETS = {
  ethereum: [
    {
      // mUSD
      address: '0xe2f2a5c287993345a840db3b0845fbc70f5935a5',
      startBlock: 10148032,
      isMasset: true,
    },
    // mBTC
    {
      address: '0x945facb997494cc2570096c74b5f66a3507330a1',
      startBlock: 11840521,
      isMasset: true,
    },
    {
      // fPmBTC/HBTC
      address: '0x48c59199da51b7e30ea200a74ea07974e62c4ba7',
      startBlock: 12146645,
    },
    {
      // fPmBTC/TBTC
      address: '0xb61a6f928b3f069a68469ddb670f20eeeb4921e0',
      startBlock: 12146645,
    },
    {
      // fPmUSD/BUSD
      address: '0xfe842e95f8911dcc21c943a1daa4bd641a1381c6',
      startBlock: 12146707,
    },
    {
      // fPmUSD/GUSD
      address: '0x4fb30c5a3ac8e85bc32785518633303c4590752d',
      startBlock: 12146745,
    },
  ],
  polygon: [
    {
      // mUSD
      address: '0xe840b73e5287865eec17d250bfb1536704b43b21',
      startBlock: 13630640,
      isMasset: true,
    },
  ],
};

const OWN_ASSETS = new Set([
  '0xe2f2a5c287993345a840db3b0845fbc70f5935a5', // Ethereum mUSD
  '0x945facb997494cc2570096c74b5f66a3507330a1', // Ethereum mBTC
  '0xe840b73e5287865eec17d250bfb1536704b43b21', // Polygon mUSD
]);

async function getLockedForAsset(chain, asset, block) {
  const { output: { personal, data } } = await sdk.api.abi.call({
    chain,
    target: asset.address,
    block,
    abi: MASSET_ABI_V2.getBassets,
  });

  return personal.reduce(
    (lockedTokens, [address], i) => ({ ...lockedTokens, [address]: data[i][1] }),
    {},
  )
}

function tvlForChain(chain) {
  const assets = ASSETS[chain]
  const isEthereum = chain === 'ethereum'

  return async function tvl(timestamp, ethBlock, chainBlocks) {
    const block = isEthereum ? ethBlock : chainBlocks[chain];

    const assetBalances = await Promise.all(
      assets
        .filter(({ startBlock }) => block > startBlock)
        .map((asset) => getLockedForAsset(chain, asset, block))
    );

    const lockedBalances = {};

    assetBalances
      .forEach((locked) => Object.entries(locked)
        // No double-dipping; avoid double-counting mAssets
        .filter(([underlying]) => !OWN_ASSETS.has(underlying.toLowerCase()))
        .map(([underlying, balance]) => (
          [isEthereum ? underlying : `${chain}:${underlying}`, balance]
        ))
        .forEach(([address, balance]) =>
          sdk.util.sumSingleBalance(lockedBalances, address, balance)
        )
      );

    return lockedBalances;
  }
}

const ethereumTvl = tvlForChain('ethereum')
const polygonTvl = tvlForChain('polygon')

module.exports = {
  name: 'mStable',
  token: 'MTA',
  category: 'assets',
  start: 1590624000, // May-28-2020 00:00:00
  polygon: {
    tvl: polygonTvl,
  },
  ethereum: {
    tvl: ethereumTvl,
  },
  tvl: sdk.util.sumChainTvls([ethereumTvl, polygonTvl]),
};

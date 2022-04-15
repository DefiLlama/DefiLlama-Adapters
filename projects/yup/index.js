const sdk = require('@defillama/sdk');

const YUP_ABI = require('./abi.json');

const ASSETS = {
  ethereum: [
    {
      // YUP
      address: '0x69bBC3F8787d573F1BBDd0a5f40C7bA0Aee9BCC9',
      startBlock: 14268227,
      isMasset: true,
    },
  ],
  polygon: [
    {
      // YUP
      address: '0x086373fad3447F7F86252fb59d56107e9E0FaaFa',
      startBlock: 24818176,
      isMasset: true,
    },
    {
      // YUP/wETH Quickswap
      address: '0xabc4250b8813D40c8C42290384C3C8c8BA33dBE6',
      startBlock: 25207322,
    },
    {
      // YUP/ETH Uniswap
      address: '0xa378721517B5030D9D17CaF68623bB1f2CcF5c2e',
      startBlock: 25207288,
    },
  ],
};

const OWN_ASSETS = new Set([
  '0x69bbc3f8787d573f1bbdd0a5f40c7ba0aee9bcc9', // Ethereum YUP
  '0x086373fad3447f7f86252fb59d56107e9e0faafa', // Polygon YUP
]);

async function getLockedForAsset(chain, asset, block) {
  const { output: { personal, data } } = await sdk.api.abi.call({
    chain,
    target: asset.address,
    block,
    abi: YUP_ABI.getBassets,
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
  start: 1590624000, // May-28-2020 00:00:00
  polygon: {
    tvl: polygonTvl,
  },
  ethereum: {
    tvl: ethereumTvl,
  },
};

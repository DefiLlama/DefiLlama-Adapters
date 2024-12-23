const sdk = require('@defillama/sdk');

const XY_CONTRACT = '0xD4fe6e1e37dfCf35E9EEb54D4cca149d1c10239f';
const XY_ETH_POOL = '0xe9766D6aed0A73255f95ACC1F263156e746B70ba';
const C_POOL = '0x2b2e23b7c1b0de9040011b860cc575650d0817f7';

async function tvl(_, _block, chainBlocks) {
  try {
    const xyInPool = await sdk.api.erc20.balanceOf({
      target: XY_CONTRACT,
      owner: XY_ETH_POOL,
      chain: 'arbitrum',
      block: chainBlocks['arbitrum'],
    });

    const xyInCurvePool = await sdk.api.erc20.balanceOf({
      target: XY_CONTRACT,
      owner: C_POOL,
      chain: 'arbitrum',
      block: chainBlocks['arbitrum'],
    });

    const totalTVL = (xyInPool.output / 1e18) + (xyInCurvePool.output / 1e18);
    return { "arbitrum": totalTVL };
  } catch (error) {
    console.error('Error fetching balance:', error);
    return { arbitrum: 0 };
  }
}

module.exports = {
  arbitrum: { tvl },
};

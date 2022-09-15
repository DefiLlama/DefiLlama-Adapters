const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const stripsContract = '0xFC03E4A954B7FF631e4a32360CaebB27B6849457';
const usdc = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const chain = 'arbitrum';

async function getMarkets(block) {
  const { output: allMarkets } = await sdk.api.abi.call({
    abi: abi['getAllMarkets'],
    target: stripsContract,
    chain,
    block,
  });
  return allMarkets.filter(c => c.created).map(c => c.market);
};

async function pool2(timestamp, block, chainBlocks) {
  const contracts = await getMarkets(block);
  return {
    [usdc]: (await sdk.api.abi.multiCall({
      calls: contracts.map(m => ({
        target: m,
      })),
      abi: abi.getLiquidity,
      block,
      chain,
    })).output.reduce((a, b) => Number(a) + Number(b.output), 0)
  };
} // node test.js projects/strips/index.js

module.exports = {
  arbitrum: {
    tvl: () => ({}),
    pool2
  },
  methodology: 'Balance of USDC (fees) held by each market as core TVL as well as STRP/USDC SLP held by each market as pool2'
};
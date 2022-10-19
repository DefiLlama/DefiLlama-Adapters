const sdk = require('@defillama/sdk');
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getNumMarkets, getMarketTokenAddress } = require('./dolomite-margin.json');

const dolomiteMargin = '0x6bd780e7fdf01d77e4d475c821f1e7ae05409072';

const contracts = [dolomiteMargin];

async function getTokens(chain, block) {
  const { output: tokenCount } = await sdk.api.abi.call({
    target: contracts[0],
    abi: getNumMarkets,
    chain: chain,
    block: block,
    params: [],
  });

  const tokenCalls = []
  for (let i = 0; i < Number(tokenCount); i++) {
    tokenCalls.push({
      target: dolomiteMargin,
      params: [i],
    });
  }

  const { output: tokensResult } = await sdk.api.abi.multiCall({
    chain,
    block,
    abi: getMarketTokenAddress,
    calls: tokenCalls,
  })

  return tokensResult.map(tokenResult => tokenResult.output)
}

async function tvl (timestamp, ethereumBlock, blocksToKeys) {
  const chain = 'arbitrum';
  const block = blocksToKeys[chain]

  const tokens = await getTokens(chain, block);

  return sumTokens2({
    tokens,
    chain,
    block,
    owner: dolomiteMargin,
  })
}

module.exports = {
  start: 1664856000,  // 10/4/2022 @ 00:00am (UTC)
  arbitrum: { tvl },
  hallmarks:[]
};

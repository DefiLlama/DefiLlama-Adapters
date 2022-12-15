const sdk = require('@defillama/sdk');
const near = require('../helper/chain/near');

const config = {
  'bsc': {
    'mosAddress': '0x630105189c7114667a7179Aa57f07647a5f42B7F',
    'tokenHoldingList': [
      '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d' // usdc
    ]
  },
  'near': {
    'mosAddress': 'mos.mfac.butternetwork.near',
    'tokenHoldingList': [
      'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near' // usdc
    ]
  },
  'polygon': {
    'mosAddress': '0x630105189c7114667a7179Aa57f07647a5f42B7F',
    'tokenHoldingList': [
      '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'  // usdc
    ]
  }
}

async function bscTvl(timestamp, block, chainBlocks) {
  return await evmTvl('bsc', timestamp, block, chainBlocks)
}

async function polygonTvl(timestamp, block, chainBlocks) {
  return await evmTvl('polygon', timestamp, block, chainBlocks)
}

async function nearTvl(timestamp, block, chainBlocks) {
  const chain = 'near';
  const balances = {};

  const mosAddress = config[chain].mosAddress;
  const tokenHoldingList = config[chain].tokenHoldingList;

  for (let token of tokenHoldingList) {
    const balance = await near.getTokenBalance(token, mosAddress);
    sdk.util.sumSingleBalance(balances, token, balance)
  }

  return balances;
}

async function evmTvl(chain, timestamp, block, chainBlocks) {
  const mosAddress = config[chain].mosAddress;
  const tokenHoldingList = config[chain].tokenHoldingList;

  const tokenBalances = await sdk.api.abi.multiCall({
    calls: tokenHoldingList.map((tokenAddress) => ({
      target: tokenAddress,
      params: mosAddress
    })),
    abi: 'erc20:balanceOf',
    block: chainBlocks[chain],
    chain: chain
  })

  const balances = {};
  sdk.util.sumMultiBalanceOf(balances, tokenBalances)
  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'get the amount of token deposited in MOS contract on each supported chain.',
  bsc: {
    tvl: bscTvl,
  },
  polygon: {
    tvl: polygonTvl
  },
  near: {
    tvl: nearTvl
  }
};
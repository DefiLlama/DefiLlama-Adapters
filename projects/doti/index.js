const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require('../helper/unwrapLPs');

// DotI Protocol Authority & Registry Contract
const DOTI_REGISTRY = '0xf853F8243F10a57CF5e43A49F156F132c05C21a6';

// 1. Arbitrum One (Primary Authority & Registry)
async function arbitrumTvl(api) {
  return sumTokens2({
    api,
    owners: [DOTI_REGISTRY],
    tokens: [ADDRESSES.null], // Native ETH on Arbitrum
  });
}

// 2. Optimism (OP Mainnet)
async function opTvl(api) {
  return sumTokens2({
    api,
    owners: [DOTI_REGISTRY],
    tokens: [ADDRESSES.null], // Native ETH on Optimism
  });
}

// 3. Ethereum Mainnet
async function ethereumTvl(api) {
  return sumTokens2({
    api,
    owners: [DOTI_REGISTRY],
    tokens: [ADDRESSES.null], // Native ETH
  });
}

module.exports = {
  methodology: 'Tracks native ETH and assets across DotI Name Service contracts on Arbitrum One, Optimism, and Ethereum.',
  arbitrum: {
    tvl: arbitrumTvl,
  },
  optimism: {
    tvl: opTvl,
  },
  ethereum: {
    tvl: ethereumTvl,
  },
};

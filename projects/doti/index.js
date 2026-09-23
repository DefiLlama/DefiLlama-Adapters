const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require('../helper/unwrapLPs');

// DotI Protocol Contracts on Arbitrum One
const DOTI_REGISTRY = '0xf853F8243F10a57CF5e43A49F156F132c05C21a6';

async function arbitrumTvl(api) {
  // Tracks any ETH or wrapped assets held in DotI protocol contracts on Arbitrum
  return sumTokens2({
    api,
    owners: [DOTI_REGISTRY],
    tokens: [ADDRESSES.null], // Native ETH
  });
}

module.exports = {
  methodology: 'Counts ETH held in DotI Name Service contracts on Arbitrum One.',
  arbitrum: {
    tvl: arbitrumTvl,
  },
};

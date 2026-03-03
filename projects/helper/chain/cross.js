const sdk = require('@defillama/sdk');

const NATIVE_ADDRESSES = [
    '0x642060e8B44C8f2d6D2974a71a0ca8F995cAfBdA',
    '0x0000000000000000000000000000000000000000',
  ];

const CROSS_CHAIN_CONFIG = {
  chainName: 'cross',
  nativeCoin: {
    symbol: 'CROSS',
    decimals: 18,
    nativeAddress: NATIVE_ADDRESSES,
    bscAddress: '0x6bf62ca91e397b5a7d1d6bce97d9092065d7a510',
    coingeckoId: 'cross-2',
  },
};

function addCrossToken(balances, tokenAddress, amount) {
  if (NATIVE_ADDRESSES.includes(tokenAddress)) {
    sdk.util.sumSingleBalance(
        balances, 
        `bsc:${CROSS_CHAIN_CONFIG.nativeCoin.bscAddress}`, 
        amount
      );
  }
}

module.exports = {
  CROSS_CHAIN_CONFIG,
  addCrossToken,
};

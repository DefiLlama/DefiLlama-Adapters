const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require('../helper/unwrapLPs');

const walletAddresses = {
  tron: ['TSqP4Zu85qAB1MmJBTJUWzoKX99ECHXNV4', 'TXNbg1az7empT87BPTvgufgeqy8EDUa7fg']
};

const tokenAddress = {
  tron: [
    ADDRESSES.tron.USDT,
  ]
}

module.exports = {
  tron: {
    tvl: sumTokensExport({ owners: walletAddresses.tron, tokens: tokenAddress.tron }),
  }
};

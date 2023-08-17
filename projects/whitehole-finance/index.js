const { compoundExports2 } = require("../helper/compound");

module.exports = {
  arbitrum: compoundExports2({  comptroller: '0x1d019f2d14bdb81bab7ba4ec7e20868e669c32b1', abis: { getAllMarkets: 'address[]:allMarkets', totalBorrows: 'uint256:totalBorrow' } }),
};

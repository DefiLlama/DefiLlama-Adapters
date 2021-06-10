const BigNumber = require('bignumber.js');

module.exports = {
  mergeBalances: function(balances1, balances2) {
    const tokenAddresses = new Set(Object.keys(balances1).concat(Object.keys(balances2)));

    return (
      Array
        .from(tokenAddresses)
        .reduce((accumulator, tokenAddress) => {
          const bl1 = new BigNumber(balances1[tokenAddress] || '0');
          const bl2 = new BigNumber(balances2[tokenAddress] || '0');
          accumulator[tokenAddress] = bl1.plus(bl2).toFixed();

          return accumulator
        }, {})
    );
  }
}

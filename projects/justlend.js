const { get } = require('./helper/http')
const { toUSDTBalances } = require('./helper/balances');

function core(borrowed){
return async () => {
  const response = (
    await get(
        'https://labc.ablesdxd.link/justlend/markets/dashboard')
    ).data;

  const tvl = response.totalDepositedUSD - response.totalBorrowedUSD;

  return toUSDTBalances(borrowed? response.totalBorrowedUSD : tvl);
};
}

module.exports = {
  misrepresentedTokens: true,
  tron: {
    tvl: core(false),
    borrowed: core(true),
  },
};

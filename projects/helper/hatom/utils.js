const BigNumber = require("bignumber.js");

const sumatory = (array) =>
   array.reduce((prev, current) => prev.plus(current), BigNumber(0))

const formatMoneyMarketsCash = (moneyMarketsData) => {
   return moneyMarketsData.map(
      ({ underlying, exchangeRate, cash, priceUSD }) => {
         return (
            BigNumber(cash)
               .dividedBy(`1e${underlying.decimals}`)
               .multipliedBy(priceUSD)
         );
      }
   )
};

const formatMoneyMarketsBorrows = (moneyMarkets) => {
   return moneyMarkets.map(({ underlying, borrows, priceUSD }) => {
      return BigNumber(borrows)
         .dividedBy(`1e${underlying.decimals}`)
         .multipliedBy(priceUSD)
   });
};

const exportLendingData = (lendingCash, lendingBorrows) => {
   return {
      tvl: lendingCash,
      borrows: lendingBorrows,
   };
};

const exportLiquidStakingData = (liquidStakingTotalReserveUsd) => {
   return {
      tvl: liquidStakingTotalReserveUsd,
   };
};

module.exports = {
   sumatory,
   formatMoneyMarketsCash,
   formatMoneyMarketsBorrows,
   exportLendingData,
};

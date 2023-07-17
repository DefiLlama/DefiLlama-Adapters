const { default: BigNumber } = require("bignumber.js");
const client = require("./multiversx-client");
const bigintConversion = require("bigint-conversion");

const getMoneyMarketCash = async (moneyMarketAddress) => {
   const response = await client({
      address: moneyMarketAddress,
      method: "getCash",
   });
   if (response === 0) {
      return BigNumber(0).toString();
   }
   const bigIntFromBuf = bigintConversion.bufToBigint(
      Uint8Array.from(response.values[0])
   );

   return BigNumber(bigIntFromBuf.toString()).toString();
};

const getMoneyMarketBorrows = async (moneyMarketAddress) => {
   const response = await client({
      address: moneyMarketAddress,
      method: "getTotalBorrows",
   });
   if (response === 0) {
      return BigNumber(0).toString();
   }
   const bigIntFromBuf = bigintConversion.bufToBigint(
      Uint8Array.from(response.values[0])
   );
   return BigNumber(bigIntFromBuf.toString()).toString();
};

const getMoneyMarketTotalSupply = async (moneyMarketAddress) => {
   const response = await client({
      address: moneyMarketAddress,
      method: "getTotalSupply",
   });
   if (response === 0) {
      return BigNumber(0).toString();
   }
   const bigIntFromBuf = bigintConversion.bufToBigint(
      Uint8Array.from(response.values[0])
   );
   return BigNumber(bigIntFromBuf.toString()).toString();
};

const getMoneyMarketTotalReserves = async (moneyMarketAddress) => {
   const response = await client({
      address: moneyMarketAddress,
      method: "getTotalReserves",
   });
   if (response === 0) {
      return BigNumber(0).toString();
   }
   const bigIntFromBuf = bigintConversion.bufToBigint(
      Uint8Array.from(response.values[0])
   );
   return BigNumber(bigIntFromBuf.toString()).toString();
};

const getMoneyMarketSupplyRate = async (moneyMarketAddress) => {
   const response = await client({
      address: moneyMarketAddress,
      method: "getSupplyRate",
   });
   if (response === 0) {
      return BigNumber(0).toString();
   }
   const bigIntFromBuf = bigintConversion.bufToBigint(
      Uint8Array.from(response.values[0])
   );
   return BigNumber(bigIntFromBuf.toString()).toString();
};

const getLiquidStakingCashReserve = async (liquidStakingAddress) => {
   const response = await client({
      address: liquidStakingAddress,
      method: "getCashReserve",
   });
   if (response === 0) {
      return BigNumber(0).toString();
   }
   const bigIntFromBuf = bigintConversion.bufToBigint(
      Uint8Array.from(response.values[0])
   );
   return BigNumber(bigIntFromBuf.toString()).toString();
};

module.exports = {
   getMoneyMarketCash,
   getMoneyMarketBorrows,
   getLiquidStakingCashReserve,
   getMoneyMarketTotalSupply,
   getMoneyMarketTotalReserves,
   getMoneyMarketSupplyRate,
};

const { default: BigNumber } = require("bignumber.js");
const client = require("./multiversx-client");
const bigintConversion = require("bigint-conversion");

const getMoneyMarketCash = async (moneyMarketAddress) => {
   const response = await client({
      address: moneyMarketAddress,
      method: "getCash",
   });

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

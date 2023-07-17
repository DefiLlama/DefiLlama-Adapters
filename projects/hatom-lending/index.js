const { getMoneyMarkets, getTokenPrices } = require("../helper/hatom/hatom-graph");
const {
  getMoneyMarketCash,
  getMoneyMarketBorrows,
} = require("../helper/hatom/on-chain");
const {
  formatMoneyMarketsCash,
  formatMoneyMarketsBorrows,
  sumatory,
} = require("../helper/hatom/utils");
const ADDRESSES = require('../helper/coreAssets.json');
const BigNumber = require("bignumber.js");

const getMoneyMarketCashData = (moneyMarkets, tokenPrices) => {
  return Promise.all(
    moneyMarkets.map(async ({ address, underlying }) => {
      const cash = await getMoneyMarketCash(address);
      const priceUSD = tokenPrices?.[underlying.id] || "0";

      return {
        address,
        cash,
        priceUSD,
        underlying,
      };
    })
  );
};

const getMoneyMarketBorrowData = (moneyMarkets, tokenPrices) => {
  return Promise.all(
    moneyMarkets.map(async ({ address, underlying }) => {
      const borrows = await getMoneyMarketBorrows(address);
      const priceUSD = tokenPrices?.[underlying.id] || "0";

      return {
        address,
        borrows,
        priceUSD,
        underlying,
      };
    })
  );
};

const tvl = async () => {
  // Fetching data off chain
  const [tokenPrices, moneyMarkets] = await Promise.all([
    getTokenPrices(),
    getMoneyMarkets(),
  ]);
  // Fetching data on chain
  const moneyMarketsData = await getMoneyMarketCashData(moneyMarkets, tokenPrices);
  // Formatting data
  const moneyMarketsCash = formatMoneyMarketsCash(moneyMarketsData)
  const totalLendingCash = sumatory(moneyMarketsCash);

  return { [ADDRESSES.ethereum.USDC]: totalLendingCash.multipliedBy(1e6).toNumber() }
};

const borrowed = async () => {
  // Fetching data off chain
  const [tokenPrices, moneyMarkets] = await Promise.all([
    getTokenPrices(),
    getMoneyMarkets(),
  ]);

  // Fetching data on chain
  const moneyMarketsData = await getMoneyMarketBorrowData(moneyMarkets, tokenPrices);

  // Formatting data
  const moneyMarketsBorrows = await formatMoneyMarketsBorrows(moneyMarketsData)
  const totalLendingBorrows = sumatory(moneyMarketsBorrows);
  return { [ADDRESSES.ethereum.USDC]: totalLendingBorrows.multipliedBy(1e6).toNumber() }
};

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  elrond: {
    tvl: tvl,
    borrowed: borrowed
  },
};

const { ethers } = require("ethers");

const COINGECKO_PRICE_FETCH_URL = 'https://www.coingecko.com/price_charts/29340/usd/24_hours.json';

const bankrollTokensDetails = {
  '0x59edbB343991D30f77dcdBad94003777e9B09BA9': {
    symbol: 'USDC',
    decimals: 6
  },
  '0xBF6FA9d2BF9f681E7b6521b49Cf8ecCF9ad8d31d': {
    symbol: 'WWINR',
    decimals: 18
  },
  '0x0381132632E9E27A8f37F1bc56bd5a62d21a382B': {
    symbol: 'USDT',
    decimals: 6
  },
  '0xF2857668777135E22f8CD53C97aBf8821b7F0bdf': {
    symbol: 'ARB',
    decimals: 18
  },
  '0xE60256921AE414D7B35d6e881e47931f45E027cf': {
    symbol: 'ETH',
    decimals: 18
  },
  '0x5B20DcAB6B91f157A39036c6c0e6F16e56d74CDb': {
    symbol: 'SOL',
    decimals: 18
  },
}

/**
 * Represents a timestamp and its associated value.
 * @typedef {Array<number, number>} TimestampValue
 * @property {number} 0 - The timestamp in milliseconds since the Unix epoch.
 * @property {number} 1 - The value associated with the timestamp.
 */

/**
 * Represents market data with statistics and total volumes.
 * @interface MarketData
 * @property {TimestampValue[]} stats - An array of timestamp-value pairs representing market statistics.
 * @property {TimestampValue[]} total_volumes - An array of timestamp-value pairs representing total volumes.
 */

/**
 * Fetches the price of WINR from Coingecko.
 * @returns {Promise<MarketData>} The price data.
 */
async function fetchWinrPrice() {
  const res = await fetch(COINGECKO_PRICE_FETCH_URL);

  if (!res.ok) {
    throw new Error('Failed to fetch price');
  }

  const data = (await res.json());

  return data;
}

function convertToUsd(tokenAddress, tokenPrice, tokenAmount) {
  const tokenDetails = bankrollTokensDetails[tokenAddress];
  const tokenDecimals = tokenDetails.decimals;

  const dollarAmount = BigInt(tokenAmount * tokenPrice) / BigInt(10 ** tokenDecimals);

  return Number(ethers.formatUnits(dollarAmount, 8));
}

module.exports = {
  convertToUsd,
  fetchWinrPrice,
}
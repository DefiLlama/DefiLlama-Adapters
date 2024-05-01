const { sumTokensExport } = require("../helper/unwrapLPs");

const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const STONE = '0x7122985656e38BDC0302Db86685bb972b145bD3C';
const LOCK_CONTRACT = '0xD6572c7Cd671ECF75d920aDcd200B00343959600';

module.exports = {
  methodology: 'counts the number of (USDC AND STONE) in the lock contract.',
  start: 19710229,
  ethereum: {
    tvl: sumTokensExport({ owner: LOCK_CONTRACT, tokens: [USDC, STONE] }),
  }
}; 

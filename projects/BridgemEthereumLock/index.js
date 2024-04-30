const { sumTokensExport } = require("../helper/unwrapLPs");

const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const STONE = '0xEc901DA9c68E90798BbBb74c11406A32A70652C3';
const LOCK_CONTRACT = '0xD6572c7Cd671ECF75d920aDcd200B00343959600';

module.exports = {
  methodology: 'counts the number of (USDC AND STONE) in the lock contract.',
  start: 19710229,
  ethereum: {
    tvl: sumTokensExport({ owner: LOCK_CONTRACT, tokens: [USDC, STONE] }),
  }
}; 

const ADDRESSES = require('../helper/coreAssets.json');

const BSC_MARKET_CONTRACT = '0xab1fB9B0efA9235AFF385639611cB1BbbbCc3b40';
const BASE_MARKET_CONTRACT = '0x5035608222e1C226781CAa22fe40D0DB6cc6c119';

async function bscTvl(api) {
  const balance = await api.call({
    abi: 'erc20:balanceOf',
    target: ADDRESSES.bsc.USDT,
    params: [BSC_MARKET_CONTRACT],
  });
  
  api.add(ADDRESSES.bsc.USDT, balance);
}

async function baseTvl(api) {
  const balance = await api.call({
    abi: 'erc20:balanceOf',
    target: ADDRESSES.base.USDC,
    params: [BASE_MARKET_CONTRACT],
  });
  
  api.add(ADDRESSES.base.USDC, balance);
}

module.exports = {
  methodology: 'TVL is calculated as the sum of all tokens (USDT on BSC, USDC on Base) held in the main protocol betting contracts. Only active market pots are included - settled markets with paid out funds are excluded from TVL.',
  start: 1712016000, // April 1, 2024 timestamp
  bsc: {
    tvl: bscTvl,
  },
  base: {
    tvl: baseTvl,
  }
};
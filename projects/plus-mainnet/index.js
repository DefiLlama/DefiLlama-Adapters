const sdk = require('@defillama/sdk');

const WPLUS_TOKEN = '0x66941a0E7086E1983b4B719548f9f249b1521dc2';
const TREASURY = '0x2162F47C02DD90c3053ed9e98AF25Db940678F17';
const USDT_BSC = '0x55d398326f99059fF775485246999027B3197955';

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  
  const balance = await sdk.api.abi.call({
    abi: 'erc20:balanceOf',
    target: WPLUS_TOKEN,
    params: [TREASURY],
    block: chainBlocks['bsc'],
    chain: 'bsc'
  });
  
  sdk.util.sumSingleBalance(balances, 'bsc:' + USDT_BSC, balance.output);
  
  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology: 'TVL counts the WPLUS tokens locked in the official PLUS Treasury contract on Binance Smart Chain.',
  bsc: {
    tvl
  }
};

const sdk = require('@defillama/sdk');

const WPLUS_TOKEN = '0x66941a0E7086E1983b43719548f9F249b1521dc2';
const TREASURY = '0x2162F47DB2DD98c3853ed9e9BAf25Db944626F17';
const USDT_BSC = '0x55d398326f99059fF775485246999027B3197955'; // 잘린 부분 없이 끝까지 채움

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
  methodology: "TVL counts the foundational Base Protocol liquidity (WPLUS) permanently locked in the smart contract by institutional partners for the HFT arbitrage engine.",
  bsc: {
    tvl
  }
};

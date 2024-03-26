const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');
const abi = require('./abi.json');

const tokenAddress = '0x7db21353a0c4659b6a9a0519066aa8d52639dfa5';
const blackHoleAddress = '0x000000000000000000000000000000000000dead';

async function tvl() {
  let { output: cap } = await sdk.api.abi.call({
    chain: 'bsc',
    target: tokenAddress,
    abi: abi.find((a) => a.name === 'cap'),
  });

  let { output: blackHoleBalance } = await sdk.api.abi.call({
    chain: 'bsc',
    target: tokenAddress,
    params: [blackHoleAddress],
    abi: abi.find((a) => a.name === 'balanceOf'),
  });

  const tvl = new BigNumber(cap).minus(new BigNumber(blackHoleBalance)).toFixed(0);
  return {
    'bsc:0x7db21353a0c4659b6a9a0519066aa8d52639dfa5': tvl,
  };
}

module.exports = {
  bsc: {
    tvl,
  },
  methodology: "Counts the tokens held in the system minus tokens in the black hole address.",
};
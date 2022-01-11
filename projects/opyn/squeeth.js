const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');

const START_BLOCK = 13982541;
const controller = "0x64187ae08781B09368e6253F9E94951243A493D5".toLowerCase();
const ETH = '0x0000000000000000000000000000000000000000';

module.exports.tvl = async function tvl(timestamp, block) {  
  let balances = {};

  if(block >= START_BLOCK) {
    // get ETH balance
    const balance = (await sdk.api.eth.getBalance({ target: controller, block})).output;
    balances[ETH] = BigNumber(balances[ETH] || 0).plus(BigNumber(balance)).toFixed();
  }

  return balances;
}
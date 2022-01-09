const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');

const START_BLOCK = 13944813;
const controller = "0x4c1fd946A082d26b40154EabD12F7A15a0cB3020";
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
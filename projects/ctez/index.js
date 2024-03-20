const BigNumber = require('bignumber.js');

const START_BLOCK = 2062236;
const OVEN_FACTORY = 'KT1GWnsoFZVHGh7roXEER3qeCcgJgrXT3de2';

async function tvl(params) {
  const { block, web3 } = params;
  if (block < START_BLOCK) {
    return {};
  }

  const balances = { xtz: '0' };

  const ovenRegistry = new web3.eth.Contract(null, OVEN_FACTORY);
  await ovenRegistry.methods.init().call(); // Suppose the method for initializing a contract is called init()

  const ovens = await ovenRegistry.methods.getBigmap('ovens').call(null, block);

  ovens.forEach(oven => {
    balances['xtz'] = new BigNumber(balances['xtz'])
      .plus(oven.value.tez_balance)
      .toFixed();
  });

  convertBalancesToFixed(balances); // Suppose you have an implementation of the convertBalancesToFixed function

  return { balances };
}

module.exports = { tvl };

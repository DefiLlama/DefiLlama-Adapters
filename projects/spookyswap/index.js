const {calculateUniTvl} = require('../helper/calculateUniTvl.js')
const {transformFantomAddress} = require('../helper/portedTokens.js');
const { staking } = require('../helper/staking.js');

const factory = '0x152eE697f2E276fA89E96742e9bB9aB1F2E61bE3'
async function tvl(_timestamp, _ethBlock, chainBlocks){
  const transform = await transformFantomAddress();

  const balances = await calculateUniTvl(transform, chainBlocks['fantom'], 'fantom', factory, 3795376, true);
  return balances
}

module.exports = {
  staking:{
    tvl: staking("0xa48d959AE2E88f1dAA7D5F611E01908106dE7598", "0x841fad6eae12c286d1fd18d1d525dffa75c7effe", "fantom")
  },
  fantom:{
    tvl,
  },
  tvl
}
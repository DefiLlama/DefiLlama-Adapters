const {calculateUniTvl} = require('../helper/calculateUniTvl.js')
const {transformFantomAddress} = require('../helper/portedTokens.js');
const { staking } = require('../helper/staking.js');

const factory = '0xdf0a0a62995ae821d7a5cf88c4112c395fc41358'
async function tvl(_timestamp, _ethBlock, chainBlocks){
  const transform = await transformFantomAddress();

  const balances = await calculateUniTvl(transform, chainBlocks['fantom'], 'fantom', factory, 23006319, true);
  return balances
}

module.exports = {
  fantom:{
    staking: staking("0xa9d452E3CEA2b06d7DBE812A6C3ec81cf52334dD", "0x97058c0B5ff0E0E350e241EBc63b55906a9EADbc", "fantom"),
    tvl,
  },
}
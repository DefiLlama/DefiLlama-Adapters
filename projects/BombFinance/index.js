const {calculateUniTvl} = require('../helper/calculateUniTvl.js')
const {transformFantomAddress} = require('../helper/portedTokens.js')

const factory = '0xD9473A05b2edf4f614593bA5D1dBd3021d8e0Ebe'
async function tvl(_timestamp, _block, chainBlocks){
  const transform = await transformFantomAddress();

  const balances = await calculateUniTvl(transform, chainBlocks['fantom'], 'fantom', factory, 13483113, true);
  return balances
}

module.exports = {
  fantom:{
    tvl,
  },
}

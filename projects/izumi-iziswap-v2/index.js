const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL } = require('../helper/unknownTokens');

const iziswapClassicFactory = {
  'plume_mainnet': '0x88867BF3bB3321d8c7Da71a8eAb70680037068E4',
}

const blacklistedTokens = [
  ADDRESSES.bsc.iUSD,
  '0x1382628e018010035999A1FF330447a0751aa84f',
  ADDRESSES.bsc.iUSD, // mantle iUSD
  '0x078f712f038A95BeEA94F036cADB49188a90604b', // manta iUSD
  ADDRESSES.bsc.iUSD, // merlin iUSD
]

Object.keys(iziswapClassicFactory).forEach(chain => {
  module.exports[chain] = { tvl: getUniTVL({ factory: iziswapClassicFactory[chain], blacklistedTokens }), }
})

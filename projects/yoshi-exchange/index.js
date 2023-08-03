const {uniTvlExport} = require('../helper/calculateUniTvl.js')

const factoryData = {
  fantom: {
    factory: '0xc5bc174cb6382fbab17771d05e6a918441deceea',
  },
  bsc: {
    factory: '0x542b6524abf0bd47dc191504e38400ec14d0290c',
  }
};

let tvls = {};
Object.entries(factoryData).forEach(([chain, data]) => tvls[chain] = {tvl: uniTvlExport(data.factory, chain, undefined, undefined, {
  useDefaultCoreAssets: true,
})}); 

module.exports = {
  ...tvls,
  misrepresentedTokens: true,
}

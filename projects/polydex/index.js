const {uniTvlExport} = require('../helper/calculateUniTvl.js')

const FACTORY = '0xEAA98F7b5f7BfbcD1aF14D0efAa9d9e68D82f640';


module.exports = {
  polygon: { 
    tvl: uniTvlExport(FACTORY, 'polygon'),
   }
};

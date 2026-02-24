const { aaveExports } = require("../helper/aave");
const { mergeExports } = require("../helper/utils");
const methodologies = require("../helper/methodologies");


module.exports = mergeExports([{
  methodology: methodologies.lendingMarket,
//Main
  core: aaveExports('core', '0xC3F120f418f9541263eA3F4a5a4120eb3f28EfA1', undefined, ['0x567AF83d912C85c7a66d093e41D92676fA9076E3'], { v3: true, }),
}, {
//LstBTC
  core: aaveExports('core', '0x71B2C1Dda32E4c35f02301dC611043F46CC8108f', undefined, ['0x8E43DF2503c69b090D385E36032814c73b746e3d'], { v3: true, }),
}])

const { calculateUsdUniTvl } = require('../helper/getUsdUniTvl');
module.exports = {
    misrepresentedTokens: true,
    iotex: {
      tvl: calculateUsdUniTvl(
          "0xda257cBe968202Dea212bBB65aB49f174Da58b9D", 
          "iotex", 
          "0xa00744882684c3e4747faefd68d283ea44099d03", 
          [
              "0x99b2b0efb56e62e36960c20cd5ca8ec6abd5557a",
              "0x6fbcdc1169b5130c59e72e51ed68a84841c98cd1",
              "0x17df9fbfc1cdab0f90eddc318c4f6fcada730cf2"
          ], 
          "iotex"
          )
    },
};
const { getUniTVL } = require("../helper/unknownTokens")
  
  module.exports = {
    methodology: "Counts the tokens locked on AMM pools using the factory contract(0xE236f6890F1824fa0a7ffc39b1597A5A6077Cfe9) to find all of the pairs",
    fantom: {
      tvl: getUniTVL({
        factory: '0xE236f6890F1824fa0a7ffc39b1597A5A6077Cfe9',
        chain: 'fantom',
        useDefaultCoreAssets: true,
      })
    },
  };
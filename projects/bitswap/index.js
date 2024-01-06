const { getUniTVL } = require("../helper/unknownTokens")

module.exports={
  misrepresentedTokens: true,
  bitchain:{
      tvl: getUniTVL({ useDefaultCoreAssets: true, factory: '0x357F77c780c3423d62c203B72383C77A58a92a4F' }),
  },
}
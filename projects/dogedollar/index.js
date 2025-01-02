const { sumTokensExport, nullAddress, } = require("../helper/unwrapLPs");

const DJED_ADDR = '0xA99ef299CdA10AC4Ec974370778fbd27Cfb5CF61'

module.exports = {
  methodology: 'finds the DOGE balance of the DJED instance backing the stablecoin, aswell as the fallback stablecoin balance',
  dogechain: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [nullAddress, DJED_ADDR],
      ]
    }),
  }
}; 

const { sumTokensExport, } = require('../helper/unknownTokens')

module.exports = {
  methodology: 'count the amount of ankr BNB in the vault', 
  bsc: {
    tvl: sumTokensExport({ chain: 'bsc', owner: '0x25b21472c073095bebC681001Cbf165f849eEe5E', tokens: [
      '0xE85aFCcDaFBE7F2B096f268e31ccE3da8dA2990A', // ankrBNB
    ] }),
  }
}

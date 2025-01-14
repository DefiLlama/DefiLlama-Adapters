const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')


const BLAST_FARM_WETH_ADDRESS = "0xEFF49cfEDB5A430501B01898C704003326f1791B";
const BLAST_FARM_USDB_ADDRESS = "0x02f451a37897d41e0082b7F9dB38B936D3D8E76E";


module.exports = {
  blast: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [ADDRESSES.blast.WETH, BLAST_FARM_WETH_ADDRESS],
        [ADDRESSES.blast.USDB, BLAST_FARM_USDB_ADDRESS],
      ],
    }),
  }
}

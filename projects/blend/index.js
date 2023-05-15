const { sumTokensExport } = require('../helper/unwrapLPs')
const contract = '0x29469395eaf6f95920e59f858042f0e28d98a20b'

module.exports = {
  ethereum: { tvl: sumTokensExport({ owner: contract, resolveNFTs: true, }) }
}
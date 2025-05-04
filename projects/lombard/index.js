const { sumTokens } = require('../helper/chain/bitcoin')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')
const { sumTokensExport } = require('../helper/unwrapLPs')

async function tvl() {
  return sumTokens({ owners: await bitcoinAddressBook.lombard(), forceCacheUse: true })
}

module.exports = {
  doublecounted:true,
  timetravel: false,
  isHeavyProtocol: true,
  bitcoin: { tvl },
  ethereum: { tvl: sumTokensExport({ owners: ['0x838f0c257ab27856ee9be57f776b186140834b58'], tokens: ['0xfe4ecd930a1282325aef8e946f17c0e25744de45'] })}
}
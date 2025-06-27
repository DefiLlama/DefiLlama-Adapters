const { compoundExports2 } = require('../helper/compound')
const config = {
  ethereum: { comptroller: '0xf22874F4aC836f23379f5dbd08dCA79afC523396', cether: '0x1b658a5804ee3985723114eeed6a9a22d18caa42' },
  bsc: { comptroller: '0x75fc5839108DAf601431801Ce960bbF44c476d1a', cether: '0x3920923abe2852a62e5e88a2651d192dda5709a4' },
  heco: { comptroller: '0x8bB3e552968ba906F19C217DFE98341AD9F03230', cether: '0x571fc95e14424aceb040bf68e23f92eec280042c' },
}


Object.keys(config).forEach(chain => {
  module.exports[chain] = compoundExports2(config[chain])
  // delete module.exports[chain].borrowed // removed because it is higher than deposited, probably will never be repaid
})

module.exports.bsc.borrowed = ()  => ({})
module.exports.ethereum.borrowed = ()  => ({})
module.exports.heco.borrowed = ()  => ({})

module.exports.deadFrom = '2022-12-15'  // Heco chain is retired
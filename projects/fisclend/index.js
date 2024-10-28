const { compoundExports2 } = require('../helper/compound')

module.exports = {
  apechain: compoundExports2({comptroller: '0xd11443B079D62700061F7311fC48C40B30BCEA91', cether: '0xB1974B31b60C7134978e5574F5f1fC8A16535b5D'}),
  wc: compoundExports2({comptroller: '0xE3de48DCF4968B419BB55421D6B5bF2c049DaFB2', cether: '0xCD04992D1D8d42BB432AD794103c3B498016Da88'}),
}

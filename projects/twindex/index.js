const TWX = '0x41171d5770c4c68686d1af042ada88a45b02f82b'
const MASTER_CHEF = '0x22A5C7376C76D2D7ddC88D314912217B20d6eEc0'


const { uniTvlExports } = require('../helper/unknownTokens')
module.exports = uniTvlExports({
  'bsc': '0x4E66Fda7820c53C1a2F601F84918C375205Eac3E'
}, { staking: { bsc: [MASTER_CHEF, TWX]}})
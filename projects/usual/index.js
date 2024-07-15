
const { sumTokensExport } = require('../helper/unwrapLPs')

const USYC = '0x136471a34f6ef19fe571effc1ca711fdb8e49f2b'
const treasury = '0xdd82875f0840AAD58a455A70B88eEd9F59ceC7c7'

module.exports = {
  methodology: 'TVL represents the value in RWA held by the protocol',
  ethereum: {
    tvl: sumTokensExport({ token: USYC, owner: treasury})
  }
}
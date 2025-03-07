
const { sumTokensExport } = require('../helper/unwrapLPs')

const tokens = [
  '0x136471a34f6ef19fe571effc1ca711fdb8e49f2b', // USYC
  '0x437cc33344a0B27A429f795ff6B469C72698B291'  // wM
]

const owners = [
  '0xdd82875f0840AAD58a455A70B88eEd9F59ceC7c7', // treasury
  '0x4Cbc25559DbBD1272EC5B64c7b5F48a2405e6470'  // USUALM
]


module.exports = {
  methodology: 'TVL represents the value in RWA held by the protocol',
  ethereum: { tvl: sumTokensExport({ tokens, owners })}
}
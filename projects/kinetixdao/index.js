// KINETIXDAO (https://kinetixdao.com): Compound V2 fork lending market on KUB Chain (chain id 96).
// Not related to Kinetix Finance on Kava/Base (registry keys kinetix-v2, kinetix-v3, kinetix-derivatives-v2).
const { compoundExports2 } = require('../helper/compound')

module.exports = {
  methodology: 'TVL counts the underlying tokens (KKUB and USDT) held as cash by every market listed by the KINETIXDAO Comptroller on KUB Chain, i.e. supplied minus borrowed. Native KUB is wrapped to KKUB by the gateway before it is supplied, so it is counted as KKUB. Borrowed counts the totalBorrows of each market and is not included in TVL.',
  start: '2026-10-08', // Comptroller deployed at KUB block 35949300
  bitkub: compoundExports2({ comptroller: '0xc5DD9f1cE32f19C0a76a924F681914A8D10E8008' }),
}

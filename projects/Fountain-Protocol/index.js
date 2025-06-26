const {compoundExports2} = require('../helper/compound');
const { mergeExports } = require('../helper/utils');

const unitroller_classic_oasis = '0xA7684aE7e07Dac91113900342b3ef25B9Fd1D841';
const unitroller_usd_oasis = '0x1C0C30795802Bf2B3232a824f41629BbBCF63127';
const unitroller_lpt_oasis = '0x7c4d0c834701C6E7F57b8c1424d30aDC46eA0840';

module.exports= mergeExports([
  [unitroller_classic_oasis, '0xd7d588babfb99e82cd6dd0ca7677a5599aa678b5'],
  [unitroller_usd_oasis],
  [unitroller_lpt_oasis, '0x63f1fe2e1da490611fc16e4a5d92b7ec7d0911a9'],
].map( ([comptroller, cether]) => ({
  oasis: compoundExports2({ comptroller, cether, }),
})))

module.exports.deadFrom = '2023-06-22'
module.exports.oasis.borrowed=  () => ({})

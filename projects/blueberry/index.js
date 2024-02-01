const { compoundExports2 } = require('../helper/compound')

module.exports = {
  methodology: 'Gets the total value locked in the Blueberry Lending Market',
  ethereum: compoundExports2({ comptroller: '0xfFadB0bbA4379dFAbFB20CA6823F6EC439429ec2'}),
}
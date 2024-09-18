const { compoundExports2 } = require('../helper/compound')

const unitroller = '0xcffef313b69d83cb9ba35d9c0f882b027b846ddc'

module.exports = {
  moonriver: compoundExports2({ comptroller: unitroller, cether: '0x455d0c83623215095849abcf7cc046f78e3edae0' }),
}
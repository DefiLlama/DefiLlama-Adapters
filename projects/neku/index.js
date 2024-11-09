const { compoundExports2 } = require('../helper/compound')

const comptroller = "0xD5B649c7d27C13a2b80425daEe8Cb6023015Dc6B"
module.exports = {
  arbitrum: compoundExports2({ comptroller, cether: '0xbc4a19345c598d73939b62371cf9891128eccb8b' }),
  moonriver: compoundExports2({ comptroller, cether: '0xbc4a19345c598d73939b62371cf9891128eccb8b' }),
  bsc: compoundExports2({ comptroller, cether: '0xbc4a19345c598d73939b62371cf9891128eccb8b' }),
}
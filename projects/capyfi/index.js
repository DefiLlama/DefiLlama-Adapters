const { compoundExports2, methodology } = require('../helper/compound')

module.exports = {
  methodology,
  lac: compoundExports2({ comptroller: '0x123Abe3A273FDBCeC7fc0EBedc05AaeF4eE63060', cether: '0x465ebfceb3953e2922b686f2b4006173664d16ce' })
}

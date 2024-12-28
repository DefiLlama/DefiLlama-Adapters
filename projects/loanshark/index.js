const { compoundExports2 } = require('../helper/compound')
const comptroller = '0xEFB0697700E5c489073a9BDF7EF94a2B2bc884a5'
const cether = '0xF017f9CF11558d143E603d56Ec81E4E3B6d39D7F'

module.exports = {
  scroll: compoundExports2({ comptroller, cether, })
};

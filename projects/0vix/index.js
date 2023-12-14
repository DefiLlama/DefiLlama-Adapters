const {compoundExports2} = require('../helper/compound')

const master0vix = "0x8849f1a0cB6b5D6076aB150546EddEe193754F1C";
const oMATIC = "0xE554E874c9c60E45F1Debd479389C76230ae25A8";

module.exports = {
  hallmarks: [
    [Math.floor(new Date('2023-04-28')/1e3), 'Protocol was hacked!'],
  ],
  polygon: compoundExports2({ comptroller: master0vix, cether: oMATIC, }),
};

delete module.exports.polygon.borrowed
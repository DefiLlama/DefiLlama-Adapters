const {compoundExports2} = require('../helper/compound')

const master0vix = "0x8849f1a0cB6b5D6076aB150546EddEe193754F1C";
const oMATIC = "0xE554E874c9c60E45F1Debd479389C76230ae25A8";

module.exports = {
  hallmarks: [
    ['2023-04-28', 'Protocol was hacked!'],
    ['2023-12-14', 'Protocol was migrated to Keom!'],
  ],
  polygon: compoundExports2({ comptroller: master0vix, cether: oMATIC, }),
  polygon_zkevm: {
    tvl: () => ({}),
    borrowed: () => ({}),
  },
  deadFrom: "2023-12-14",
};

module.exports.polygon.borrowed = () => ({})
const { compoundExports2 } = require('../helper/compound')

const addresses = {
  polygon: {
    comptroller: '0xc145700AC0d8A59B1f64DcE35687dD7CA2BEB26A',
    cether: '0x7854D4Cfa7d0B877E399bcbDFfb49536d7A14fc7',
  },
  manta: {
    comptroller: '0xBd5Cd926EB73B48905091fFf9996Bba832FEAc71',
    cether: '0x8903Dc1f4736D2FcB90C1497AebBABA133DaAC76',
  }
}
module.exports = {
  polygon: compoundExports2({ ...addresses.polygon, }),
  manta: compoundExports2({ ...addresses.manta, }),
};

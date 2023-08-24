const { compoundExports2 } = require("../helper/compound");

module.exports = {
  linea: compoundExports2({
    comptroller: "0xcAABf6Ffb76634183254B0a4a3D5fb36180FdAE4",
    fetchBalances: true,
    cether: '0x91067b912f89dfca50c3f5529dbeb78b63c6a2e5',
  }),

  base: compoundExports2({
    comptroller: "0xcAABf6Ffb76634183254B0a4a3D5fb36180FdAE4",
    fetchBalances: true,
    cether: '0x91067b912f89dfca50c3f5529dbeb78b63c6a2e5',
  }),

  hallmarks: [
    [Math.floor(new Date('2023-08-16')/1e3), 'Project Rugged!'],
  ],
};

module.exports.base.borrowed = () => ({})
module.exports.linea.borrowed = () => ({})

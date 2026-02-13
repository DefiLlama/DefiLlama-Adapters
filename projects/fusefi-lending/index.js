const { compoundExports2 } = require('../helper/compound');

module.exports = {
    fuse: compoundExports2({ comptroller: '0x26a562B713648d7F3D1E1031DCc0860A4F3Fa340'}),
    hallmarks: [
    ['2022-03-31', "Ola Finance exploit"]
  ]
}

module.exports.fuse.borrowed = () => ({})
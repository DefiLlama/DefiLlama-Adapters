const { compoundExports2 } = require('../helper/compound');

module.exports = {
    fuse: compoundExports2({ comptroller: '0x26a562B713648d7F3D1E1031DCc0860A4F3Fa340'}),
    hallmarks: [
    [1648684800, "Ola Finance exploit"]
  ]
}

module.exports.fuse.borrowed = () => ({})
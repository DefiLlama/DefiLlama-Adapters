const { compoundExports2, methodology, } = require('../helper/compound');

module.exports = {
  methodology,
  ethereumclassic: compoundExports2({
    comptroller: '0x0040DCf62C380833dE60a502649567e939635fdB',
    cether: '0x2896c67c0cea9D4954d6d8f695b6680fCfa7C0e0',
  })
}; 

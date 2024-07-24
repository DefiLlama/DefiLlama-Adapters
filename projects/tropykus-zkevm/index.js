const { aaveExports, methodology } = require('../helper/aave');

module.exports = {
  methodology,
  polygon_zkevm: aaveExports("polygon_zkevm", "0x4Dac514F520D051551372d277d1b2Fa3cF2AfdFF"),
}
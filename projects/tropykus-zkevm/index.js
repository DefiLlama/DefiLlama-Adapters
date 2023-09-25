const { aaveExports } = require('../helper/aave');

module.exports = {
  methodology: `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending`,
  polygon_zkevm: aaveExports("polygon_zkevm", "0x4Dac514F520D051551372d277d1b2Fa3cF2AfdFF"),
}
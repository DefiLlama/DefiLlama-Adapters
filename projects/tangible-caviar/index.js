const PEARL = '0x7238390d5f6F64e67c3211C343A410E2A3DEc142'.toLowerCase()

const {  getPearlBalanceCaviar } = require("../tangible/abi.js");

const CAVIAR_STRATEGY = "0x4626E247390c82FA3b72A913d3d8fe079FFb84Ff";

async function tvl(api) {
  // now fetch locked pearl in Caviar
  const pearlAmountInCaviar = await api.call({ abi: getPearlBalanceCaviar, target: CAVIAR_STRATEGY, })

  api.add(PEARL, pearlAmountInCaviar);
}


module.exports = {
  polygon: { tvl, },
}

const {
  transformPolygonAddress,
  transformOptimismAddress,
} = require("../helper/portedTokens");

const CONFIG_DATA = {
  polygon: {
    transformAddress: transformPolygonAddress,
    dhedgeFactory: "0xfdc7b8bFe0DD3513Cc669bB8d601Cb83e2F69cB0",
    torosMultisigManager: "0x090e7fbd87a673ee3d0b6ccacf0e1d94fb90da59",
    daiToken: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
  },
  optimism: {
    transformAddress: transformOptimismAddress,
    dhedgeFactory: "0x5e61a079A178f0E5784107a4963baAe0c5a680c6",
    torosMultisigManager: "0x813123a13d01d3f07d434673fdc89cbba523f14d",
    daiToken: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
  },
};

module.exports = {
  CONFIG_DATA,
};

const { treasuryExports } = require("../helper/treasury")


const config = {
  ethereum: {
    resolveLP: true,
    resolveUniV3: true,
    owners: [
        "0xD275E5cb559D6Dc236a5f8002A5f0b4c8e610701",
        "0xac44F2d75876ead509a2ceB099BC14f9547b5Db6",
        "0x09fa0d3154363036ea406f254808c53f5f975518", //makerproxy
        "0xDdE0d6e90bfB74f1dC8ea070cFd0c0180C03Ad16"
    ],
  },
}

module.exports = treasuryExports(config)
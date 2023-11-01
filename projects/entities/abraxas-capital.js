const { treasuryExports } = require("../helper/treasury")
const ADDRESSES = require('../helper/coreAssets.json')


const config = {
  ethereum: {
    resolveLP: true,
    resolveUniV3: true,
    owners: [
        "0xD275E5cb559D6Dc236a5f8002A5f0b4c8e610701",
        "0xac44F2d75876ead509a2ceB099BC14f9547b5Db6"
    ],
  },
}

module.exports = treasuryExports(config)
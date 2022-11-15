const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
       '0xC882b111A75C0c657fC507C04FbFcD2cC984F071', // Oficiall https://twitter.com/gate_io/status/1592467594757693440
       // '0xd793281182a0e3e023116004778f45c29fc14f19',  // - Contract Cold Wallet
       // '0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c',  // - Cold Wallet
       // '0x7793cd85c11a924478d358d49b05b37e91b5810f',  // - Cold Wallet
       // '0x0D0707963952f2fBA59dD06f2b425ace40b492Fe',  // - Hot Wallet
    ],
  },
}

module.exports = cexExports(config)

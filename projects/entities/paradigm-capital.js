const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
        "0x11577a8a5baf1e25b9a2d89f39670f447d75c3cd",
        "0xCA8d6F69D8f32516a109Df68B623452cc9f5E64d",
        "0x917B3ACa2142Dd136fa106229990EA4D02763A83",
        "0x09F82Ccd6baE2AeBe46bA7dd2cf08d87355ac430",
        '0x820fb25352BB0c5E03E07AFc1d86252fFD2F0A18', //LIDO TOKENS
    ],
  },
}

module.exports = cexExports(config)
const { treasuryExports } = require('../helper/treasury')

const treasury = '0x3300f198988e4c9c63f75df86de36421f06af8c4'
const spk = '0xc20059e0317DE91738d13af027DfC4a50781b066'

module.exports = treasuryExports({
  ethereum: {
    owners: [treasury],
    ownTokens: [spk],
  },
})
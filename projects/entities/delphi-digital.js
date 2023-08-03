const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
        "0x5Ca29DC4845b8cB19CCF335337b774749C7Bb617",
        "0x4181805C36ad6B1b2aDb43D0b0615d676ACBF9b4",
    ],
  },
  bsc: {
    owners: [
        "0x4181805C36ad6B1b2aDb43D0b0615d676ACBF9b4"
    ],
  },
  avax: {
    owners: [
        "0x4181805C36ad6B1b2aDb43D0b0615d676ACBF9b4"
    ],
  },
}

module.exports = cexExports(config)
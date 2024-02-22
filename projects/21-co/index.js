const { cexExports } = require('../helper/cex')

const config = {
  bitcoin: {
    owners: [
      '1HTGi4tfXSEtcXD4pk6S3vBs3s64hWY1pW'
    ],
  },
  solana: {
    owners: [
      'FvLsZiM3g2ZnehkK42c4EoLASBdchKnqzxyAEmGhViZq'
    ],
  }
}

module.exports = cexExports(config)

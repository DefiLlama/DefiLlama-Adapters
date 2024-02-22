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
  },
  ripple: {
    owners: [
      'rHTG5htCXSNtcXDhFkaSsvB1s1ah6WYrFW'
    ],
  },
  litecoin: {
    owners: [
      'LbgDyHCVc6UwsKuDzt5jKwFdG5TLsN5tbf'
    ],
  },
  polkadot: {
    owners: [
      '161fEUkrGhhAog8QG1ik3sfch9UzPdvAJtUwRH6WZnsgqkuw'
    ],
  }
}

module.exports = cexExports(config)

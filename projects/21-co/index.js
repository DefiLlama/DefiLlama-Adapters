const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')


const config = {
  bitcoin: {
    owners: bitcoinAddressBook.twentyOneCo
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
  },
  cardano: {
    owners: [
      'addr1q976xcl3r2vt6he4q3rq6lyq8832v5mgpdds0e84z7vn0hma5d3lzx5ch40n2pzxp47gqw0z5efksz6mqlj029uexl0snqdsul'
    ],
  },
 doge: {
    owners: [
      'DMbNFKqJpr9B9XPfZL5zbgMTvzpN7h7sfz'
    ],
  },
 bep2: {
    owners: [
      'bnb1k3ulpgw4wzl0e8qx80u87aq9w7ekfygruzs4dg'
    ],
  },
 /* bitcoin_cash: {
    owners: [
      'qz68nu9p64ctalyuqcalslm5q4mmxey3qvr4y9mgt8'
    ],
  } */
}

module.exports = cexExports(config)

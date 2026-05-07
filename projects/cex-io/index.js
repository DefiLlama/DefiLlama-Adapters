const { cexExports } = require('../helper/cex')

const config = {
  bitcoin: {
    owners: [
      '3HfJ6brzer2fZob1ZZCyeUUUTD6vzXWdJv',
      '3FnBbsWjxLejVsMMHEqDt6B19dEupBaZwK',
      '32L7Yo5JzwnGtRgeGxrXxc8LT6CpQsL3d4',
      '3E4ujC6LQVFxhEcZ1E7ZTGYhcb67WFAuoC',
    ],
  },

  ethereum: {
    owners: [
      '0xc9f5296eb3ac266c94568d790b6e91eba7d76a11',
      '0x2818e54e0489274F61f33F163504074beE5932CA',
      '0xc48c74C4eDA47f915e8580391EC2F386F769D996',
    ],
  },

  polkadot: {
    owners: [
      '16k7GSZckaQEqatoxpvxy8QgGSquULbKJa9HgEeQjZV8YyCr',
      '14ct4em2mEorhkQBFg8eJPYyHB1y81L8tPz3qHwL1jJuDh4X',
      '12xu4vLmFGvhgX93JXVxxLJdkkngkKj4WQQcJXt2Es55G9S9',
    ],
  },

  litecoin: {
    owners: [
      'MPVaSwnMnbRortv8XajivUoiYjKMoUfsKp',
      'MTgZ3Kjiwf8Rv3HWcuAF3Ei7b6sSV9e4Nv',
      'MSEA4EakQkZ1jjr5Y613thWJqPMaQEBRdw',
      'MGAuMM1KGz8x3H2B6fC2az9BDwop7FAoqa',
      'MSkqCeihbC8vaZXQ8XB8R72kx9qLYARLWo',
    ],
  },

  ripple: {
    owners: [
      'rE1sdh25BJQ3qFwngiTBwaq3zPGGYcrjp1',
    ],
  },

  sui: {
    owners: [
      '0x8a9eb4260c0313f0c23d5858b5296235933534ff0f1692c7c1b3881fbbe53c0a',
      '0x3c7ea0026464b3ded7f3b0431e24c17bb6714d9c5de751433dacfec3fe6bc36b',
    ],
  },

  tron: {
    owners: [
      'TQ8y7omRyKSq42Tri398txQCQE4wxjk97Q',
      'TS8w3kpkav9p1dC68BsKSRfefz5ta2WMHd',
    ],
  },

  cosmos: {
    owners: [
      'cosmos1ruqrgv8wh4fqm24uyeuvmg8jwv737qv9vxl8q9',
    ],
  },

  solana: {
    owners: [
      '2QwUbEACJ3ppwfyH19QCSVvNrRzfuK5mNVNDsDMsZKMh',
      'DUru5ZfCdCnjPFuY7NPniV3hhZqNJLgn2sBZJGaMc2Sj',
      'CGRNicgpirZd3unSzn1Y34k7w31rQftTbaJwEuQu31XP',
    ],
  },

  bsc: {
    owners: [
      '0xc9f5296eb3ac266c94568d790b6e91eba7d76a11',
      '0xad6ec9801f04f45e7f6d907ec6b72246b66ff4f3',
      '0x278aa8f0d35c5582587c883ce6393542e54476a1',
      '0x8E7B542d93901560583C0c22D156eccA5191684d',
      '0xc48c74C4eDA47f915e8580391EC2F386F769D996',
    ],
  },

  stellar: {
    owners: [
      'GB3RMPTL47E4ULVANHBNCXSXM2ZA5JFY5ISDRERPCXNJUDEO73QFZUNK',
    ],
  },

  cardano: {
    owners: [
      'Ae2tdPwUPEYz3R9oSTPe1JBSfMbWSMtejQvdP31wqhWyXBFLcBiedk4esAe',
      'Ae2tdPwUPEYyjYzxV1MZpHZRh5DhfRRpgGUstspt1hHoo26P8p9cFcvibr1',
      'Ae2tdPwUPEZFH7gTGv9bTCiWWiid9ghExS2d4fT7s4FfN5kdRE4Wto6oAJW',
    ],
  },

  polygon: {
    owners: [
      '0xc9f5296eb3ac266c94568d790b6e91eba7d76a11',
      '0x8E7B542d93901560583C0c22D156eccA5191684d',
      '0xc48c74C4eDA47f915e8580391EC2F386F769D996',
    ],
  },
}

module.exports = cexExports(config)
module.exports.methodology = 'Reserves include all addresses publicly disclosed here: https://blog.cex.io/wallet-address-list. External custodial wallets are excluded.'

const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
        "0xf81b45b1663b7ea8716c74796d99bbe4ea26f488",
        "0x18D080B89570e4B996EB17fA1F0206F0CE35d604",
    ],
  },
  tron: {
    owners: [
        "TApNqy5BNx11TiNa7oibbBUV63BY5a2sNE",
        "TJP6zoGwWwUmANvMdrtqYq9iWA8qMAAY4q"
    ],
  },
  bsc: {
    owners: [
        "0xdbf7122c0b7af893580df087eabac0b3be3e9483",
        "0x6c6EC4beeAa53171a0ce0691D5c9A5FaAF509a8A"
    ],
  },
  optimism: {
    owners: [
        "0x944d6b4c2bf808f9324ca0675f1d7e0e92a35436",
    ],
  },
  avax: {
    owners: [
        "0x8fc27c899fb2c1044608516450e385378195639d",
    ],
  },
  arbitrum: {
    owners: [
        "0x040432c11ee833bdcaac2495329b65bee7cca6d9",
    ],
  },
  solana: {
    owners: [
        "7UhjbynicBP8rqcobwsAJDfRMjwgHSgdxcYNJmLwxfms",
        "3pjwKq9yuzpVYfD4h5jMZLLfV8oSd8YiwpoAaB5oZS3H"
    ],
  },
  bitcoin: {
    owners: [
        "bc1q2cvpg2c74puqke4py0ufr0aauj4m5vdeaqpjxv",
    ],
  },
}

module.exports = cexExports(config)
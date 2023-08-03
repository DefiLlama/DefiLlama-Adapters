const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
        "0xC3ad72Bf4721fdF448c970f2F8E303c57588B73c",
        "0xbFC94A95d4448C802E848C68fdD2FC0fEE4a876E"
    ],
  },
  polygon: {
    owners: [
        "0xC3ad72Bf4721fdF448c970f2F8E303c57588B73c",
        "0xbFC94A95d4448C802E848C68fdD2FC0fEE4a876E"
    ],
  },
  bsc: {
    owners: [
        "0xC3ad72Bf4721fdF448c970f2F8E303c57588B73c",
        "0xbFC94A95d4448C802E848C68fdD2FC0fEE4a876E"
    ],
  },
  avax: {
    owners: [
        "0xC3ad72Bf4721fdF448c970f2F8E303c57588B73c",
    ],
  },
  arbitrum: {
    owners: [
        "0xC3ad72Bf4721fdF448c970f2F8E303c57588B73c",
    ],
  },
}

module.exports = cexExports(config)
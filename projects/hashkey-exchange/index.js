const { cexExports } = require("../helper/cex");
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  avax: {
    owners: [
      "0xb016ebc8a1440aff7bf098b8f165af65eb898738",
      "0xa108b99c315c22673f7f5b5ca172a21628cf8334",
      "0xB7D06ea243337d98C93c11Fd114cDd50768F264e",
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.hashkeyExchange
  },
  ethereum: {
    owners: [
      "0x7ffbafdc1e4f0a4b97130b075fb4a25f807a1807", // cold 1
      "0xee1bf4d7c53af2beafc7dc1dcea222a8c6d87ad9", // cold 2
      "0xffe15ff598e719d29dfe5e1d60be1a5521a779ae",
      //     "0x7269bc4a66c755b951f068626201090f0c3098e9", // bosera funds https://www.bosera.com/english/index.html
      "0x48ee4a557e291c2a48d227e8a8dbe2217a825682",
      "0x0100dc5672f702e705fc693218a3ad38fed6553d",
    ],
  },
  litecoin: {
    owners: [
      "ltc1qh6w8epz4ycm2smpmnhfauqach28qr4ge6jffyv",
      "LSNjwQ1RGR5rbVDzCwrWiMQF8rdqVRGcPu",
      "ltc1q4qexj7a62h9uxkk0wyt55s0v8qkrc2vqdsnv02",
    ],
  },
  polygon: {
    owners: [
      "0xecd094b51bafbd7bffdf1f4fef067c5d197a1b75",
      "0xee4f6df29617f00b12f85ee56c68962cbeac16aa",
    ],
  },
  doge: {
    owners: [
      "DEovrjDhPB36kwvbyNtiYVrbWv1ahR1jQv",
      "D5qVwCrcNwNFyt4Ju4ASVKxbiYHMnjcGyj",
      "DNq9QyJTg2DTqpBemA66qVtk3VRPR6QpvH",
    ],
  },
  solana: {
    owners: [
      "HwEiRVn4ryKsTq6jECQHepLtUv2GVBfdibC4JjTDj8Su",
      "C9nsmzfv4cjkDJ8CgxSdFZnnRR1MwTyuYr6ip4nL5q3u",
    ],
  },
  ton: {
    owners: [
      "UQDd4CJlAR48mUvAJpPagHqp3AaZOs8st6Vs3tpRLbFuURT4",
      "UQDFHcps8sIKIA8Uts9n33vUhxiTPQFdtPZsGgTUlsWNVFeL",
    ],
  },
  arbitrum: {
    owners: [
      "0xF04671a9Fd6470aA01C35f713C4ae75458920592",
    ],
  },
  optimism: {
    owners: [
      "0x1557601DBA8A9Bbe3a18471A6fdb0416E2db0Ea3",
    ],
  },
  polkadot: {
    owners: [
      "16ceMbQrLZgd9mTyxe72s5KZtUcFcLDx4Kr6diijxVU21RoA",
    ],
  },
  aptos: {
    owners: [
      "0x846763265925e39951ad4f795cae687f9f22466583332f7c9e3ab1943fdad8b8",
    ],
  },
  tron: {
    owners: [
      "TR9ahL7bk9jUKzgsEPdAhssYkKPW6T45N8",
      "TQV6pEPGuyVxjUF6AJRtTELuaXaa9qLnoy",
    ],
  },
};

module.exports = cexExports(config);

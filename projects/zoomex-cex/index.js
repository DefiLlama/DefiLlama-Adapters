const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  bitcoin: {
    owners: ['1PhvgKg6FVMf2D7jxdSyJQJS8yVqKYuF8T'],
  },
  ethereum: {
    owners: [
      '0x7eb87a95948348d6ec7231b52f61281e01d53941',
      '0x8d773c8a5905284657056226a6d1b6320c2aad4a'
    ],
  },
  solana: {
    owners: [
      'CtUBgvNmNfr42VNv4LvTyU3S3uXFQ1EZZ9PDA7H91T2P'
    ],
  },
  optimism: {
    owners: [
      '0x7eb87a95948348d6ec7231b52f61281e01d53941',
    ],
  },
  arbitrum: {
    owners: [
      '0x7eb87a95948348d6ec7231b52f61281e01d53941',
    ],
  },
  bsc: {
    owners: [
      '0x7eb87a95948348d6ec7231b52f61281e01d53941',
    ],
  },
  polygon: {
    owners: [
      '0x7eb87a95948348d6ec7231b52f61281e01d53941',
    ],
  },
  mantle: {
    owners: [
      '0x7eb87a95948348d6ec7231b52f61281e01d53941',
    ],
  },
  base: {
    owners: [
      '0x7eb87a95948348d6ec7231b52f61281e01d53941',
    ],
  },
  tron: {
    owners: [
      'TA7YkTaijYM1W9SG9t2oGt6mrcDdnnLehv',
    ],
  },
  ripple: {
    owners: [
      'raq8uz1PCiSfgN94ZqUbbJWFoVtF75BEuD',
    ],
  },
  eos: {
    owners: [
      'outforzoomex',
    ],
  },
  doge: {
    owners: [
      'DDQDi8u18s4xqsUzLMrhT57rEDrrnoMiJG',
    ],
  },
  sonic: {
    owners: [
      '0x7eb87a95948348d6ec7231b52f61281e01d53941',
    ],
  },
}

module.exports = cexExports(config)
module.exports.methodology = 'We are tracking their cold and hot wallets'
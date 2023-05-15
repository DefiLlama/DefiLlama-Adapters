const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  era: {
    tvl: sumTokensExport({ owner: '0xcd98e2C68248de044c3E44144C34D9EBb09337a9', tokens: ['0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4']})
  },
  polygon_zkevm: {
    tvl: sumTokensExport({owner: '0x96DaD05740807e76892076684F433D5E0b3569fB', tokens: ['0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035']})
  }
}
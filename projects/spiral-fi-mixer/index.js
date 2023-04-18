const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  era: {
    tvl: sumTokensExport({ owner: '0xcd98e2C68248de044c3E44144C34D9EBb09337a9', tokens: ['0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4']})
  }
}
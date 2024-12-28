const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

module.exports = {
  start: '2024-01-28',
  sapphire: {
    tvl: sumTokensExport({ owner: '0x1882560361578F2687ddfa2F4CEcca7ae2e614FD', tokens: [nullAddress] }),
  },
}

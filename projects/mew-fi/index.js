const { sumTokensExport } = require('../helper/chain/ergo')

module.exports = {
  timetravel: false,
  ergo: {
    tvl: () => ({}),
    staking: sumTokensExport({ owner: '2Czxg7U54ZyGMzjt35EYX9g98H9UjFqteuYWX5CSgGCYWAjg1ng2jgm4BHjA6u1Azeo7EYQsBMVLbhRreNASJu54ho', })
  }
}

const { nullAddress, treasuryExports } = require("../helper/treasury");

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
      '0x197d7010147df7b99e9025c724f13723b29313f8',// SYNC/ETH LP
    ],
    resolveLP: true,
    owners: ['0xC00EC94e7746C6b695869580d6D2DB50cda86094'],
    ownTokens: ['0xa41d2f8Ee4F47D3B860A149765A7dF8c3287b7F0']
  },
})
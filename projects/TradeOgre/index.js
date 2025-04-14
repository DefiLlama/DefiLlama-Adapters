const { cexExports } = require('../helper/cex')

const config = {
  avax: {
    owners: [
      '0x4648451b5f87ff8f0f7d622bd40574bb97e25980'
    ]
  },
  bsc: {
    owners: [
      '0x4648451b5f87ff8f0f7d622bd40574bb97e25980'
    ]
  },
  ethereum: {
    owners: [
      '0x4648451b5f87ff8f0f7d622bd40574bb97e25980'
    ],
  },
  polygon: {
    owners: [
      '0x4648451b5f87ff8f0f7d622bd40574bb97e25980'
    ]
  },
  ripple: {
    owners: [
      'rhsZa1NR9GqA7NtQjDe5HtYWZxPAZ4oGrE'
    ]
  },
  tron: {
    owners: [
      'TBQc1xRWp2G6iUQTD51Lczrk7zbjTRoGRE'
    ]
  },  
}

module.exports = cexExports(config)
module.exports.methodology = 'All reserves information can be found on block explorers.'

const { saddleExports } = require('../helper/saddle')

const config = {
  cronos: {
    factory: '0xc4106bba1a8752e54940be71f7bd02c38e64f9e3',
    fromBlock: 2539442,
  }
}

module.exports = saddleExports(config)
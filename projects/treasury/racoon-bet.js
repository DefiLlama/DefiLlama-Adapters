const { sumTokensExport } = require('../helper/sumTokens')

const config = {
  juno: { owner: 'juno1puyjxrxkkwc9ms63a297vx2aln4kqsaeegnclknt99py59elandses9f3j' },
  migaloo: {}, // owner: 'migaloo1q6vmqprwvay5p3l0d763v50ufunt7fwfnfwp85wne5xan4meeqpsdvzyvy'
  chihuahua: { owner: 'chihuahua18s2dazpmva4t38rtnrlj3gjpsntmcdrk6v9220kt4yxckhqus3vssqsrgp' },
}

module.exports = {
  timetravel: false,
}

Object.keys(config).forEach(chain => {
  const { owner } = config[chain]
  module.exports[chain] = { tvl: sumTokensExport({ owner }) }
})
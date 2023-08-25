const { getBalance2 } = require('../helper/chain/cosmos');

async function tvl(chain, contract) {
  return await getBalance2({
    owner: contract,
    chain
  })
}

module.exports = {
  timetravel: false,
  juno: { tvl: () => tvl("juno", "juno1puyjxrxkkwc9ms63a297vx2aln4kqsaeegnclknt99py59elandses9f3j") },
  migaloo: { tvl: () => tvl("migaloo", "migaloo1q6vmqprwvay5p3l0d763v50ufunt7fwfnfwp85wne5xan4meeqpsdvzyvy") },
  chihuahua: { tvl: () => tvl("chihuahua", "chihuahua18s2dazpmva4t38rtnrlj3gjpsntmcdrk6v9220kt4yxckhqus3vssqsrgp") },
}
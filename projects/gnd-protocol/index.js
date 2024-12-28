const { sumTokens2 } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')

async function tvl(api) {
  const farm = '0xd8769d8826149b137af488b1e9ac0e3afdbc058a'
  await sumTokens2({ api, owner: farm, resolveUniV3: true, })
  const tokens = Object.keys(api.getBalances()).map(i => i.replace(/arbitrum:/gi, ''))
  return sumTokens2({ api, owner: farm, tokens, })

}
module.exports = {
  arbitrum: {
    tvl,
    staking: staking('0x535ec56479892d9C02fe2Bb86CeBF7ed62E81131', ['0x40ea7f6d6964413d4a26a0a268542dae9f55768e', '0x40ea7f6d6964413d4a26a0a268542dae9f55768e'])
  }
}
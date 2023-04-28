
const { Program } = require("@project-serum/anchor");
const { getProvider, sumTokens2, } = require("../helper/solana");
const idl = require('./idl.json')

async function tvl() {
  const provider = getProvider()
  const program = new Program(idl, 'CYPH3o83JX6jY6NkbproSpdmQ5VWJtxjfJ5P8veyYVu3', provider)
  const pools = await program.account.pool.all()
  const tokenAccounts = pools.map(({ account }) => {
    return account.nodes.map(i => i.nodeVault.toString()).filter(i => i !== '11111111111111111111111111111111')
  }).flat()
  return sumTokens2({ tokenAccounts})
}

module.exports = {
  timetravel: false,
  solana: { tvl, },
}

const abis = require('./config/flamincome/abis.js');
const sdk = require("@defillama/sdk")


async function tvl(ts, block) {

  const contracts = [
    '0x54bE9254ADf8D5c8867a91E44f44c27f0c88e88A',
    '0x1a389c381a8242B7acFf0eB989173Cd5d0EFc3e3',
    '0x1E9DC5d843731D333544e63B2B2082D21EF78ed3',
  ]
  const calls = contracts.map(t => ({ target: t }))
  const { output: token } = await sdk.api.abi.multiCall({
    block,
    calls,
    abi: abis['VaultBaseline'].find(i => i.name === 'token')
  })
  const { output: balance } = await sdk.api.abi.multiCall({
    block,
    calls,
    abi: abis['VaultBaseline'].find(i => i.name === 'balance')
  })

  const balances = {}
  token.forEach((t, i) => sdk.util.sumSingleBalance(balances, t.output, balance[i].output))
  return balances
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl,
  }
}





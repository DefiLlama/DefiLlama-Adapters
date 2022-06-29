const sdk = require('@defillama/sdk')
const { unwrapLPsAuto } = require('../helper/unwrapLPs')
const { V2, HERMES, TETHYS, NETSWAP,  } = require('./config')
const abi = require('./abi')
const { getChainTransform } = require('../helper/portedTokens')
const chain = 'metis'

async function tvl(_, _b, { [chain]: block }) {
  const balances = {}
  const transformAddress = await getChainTransform(chain)
  const vaults = Object.values(V2).map(i => i.VAULT_ADDRESS)
  const addVault = i => {
    if (i.VAULT_ADDRESS) vaults.push(i.VAULT_ADDRESS)
  }
  Object.values(HERMES).forEach(addVault)
  Object.values(TETHYS).forEach(addVault)
  Object.values(NETSWAP).forEach(addVault)
  const calls = vaults.map(i => ({ target: i }))
  const { output: tokens } = await sdk.api.abi.multiCall({
    abi: abi.token,
    calls, chain, block,
  })
  const { output: balance } = await sdk.api.abi.multiCall({
    abi: abi.balance,
    calls, chain, block,
  })

  tokens.forEach(({ output: token }, i) => {
    if (balance[i].output === 0) return;
    sdk.util.sumSingleBalance(balances, transformAddress(token), balance[i].output)
  })
  return unwrapLPsAuto({ balances, chain, block, transformAddress, })
}


module.exports = {
  doublecounted: true,
  timetravel: false,
  misrepresentedTokens: true,
  metis: {
    tvl
  },
}

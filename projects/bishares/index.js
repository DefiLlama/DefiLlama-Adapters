const sdk = require("@defillama/sdk");
const { sumTokens, unwrapLPsAuto } = require('../helper/unwrapLPs')
const { toa, vaults } = require('./config')
const abi = require('./abi')
const { getChainTransform } = require('../helper/portedTokens')

async function fantom(ts, _, { fantom: block }) {
  const chain = 'fantom'
  const transformAddress = await getChainTransform(chain)
  const calls = vaults.fantom.map(i => ({ target: i }))
  const balances = {}
  const { output: token } = await sdk.api.abi.multiCall({
    abi: abi.token,
    calls,
    chain, block,
  })
  const { output: balance } = await sdk.api.abi.multiCall({
    abi: abi.balance,
    calls,
    chain, block,
  })
  token.forEach(({ output }, idx) => sdk.util.sumSingleBalance(balances, transformAddress(output), balance[idx].output))
  await unwrapLPsAuto({ balances, block, chain, transformAddress })
  return sumTokens(balances, toa.fantom, block, 'fantom')
}


async function bsc(ts, _, { bsc: block }) {
  return sumTokens({}, toa.bsc, block, 'bsc')
}

module.exports = {
  fantom: {
    tvl: fantom
  },
  bsc: {
    tvl: bsc
  },
};

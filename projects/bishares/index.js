const { sumTokens2 } = require('../helper/unwrapLPs')
const { toa, vaults } = require('./config')
const abi = require('./abi')

async function fantom(api) {
  const chain = 'fantom'
  const calls = vaults.fantom
  const tokens  = await api.multiCall({  abi: abi.token, calls})
  const bals  = await api.multiCall({  abi: abi.balance, calls})
  api.add(tokens, bals)
  return sumTokens2({ api, tokensAndOwners: toa.fantom, resolveLP: true, })
}


async function bsc(api) {
  return sumTokens2({ api, tokensAndOwners: toa.bsc})
}

module.exports = {
  fantom: {
    tvl: fantom
  },
  bsc: {
    tvl: bsc
  },
};

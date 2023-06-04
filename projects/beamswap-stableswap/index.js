const { sumTokens2 } = require('../helper/unwrapLPs')

const abi = {
  getTokens: "address[]:getTokens",
}

async function tvl(_, _b, _2, { api }) {
  const pools = [
    '0x8273De7090C7067f3aE1b6602EeDbd2dbC02C48f', //  multichain 3 pool
    '0x09A793cCa9D98b14350F2a767Eb5736AA6B6F921', // nomad 3 pool
  ]

  const tokens = await api.multiCall({
    abi: abi.getTokens, calls: pools,
  })

  const ownerTokens = tokens.map((v, i) => [v, pools[i]])
  return sumTokens2({ api, ownerTokens, })
}

module.exports = {
  moonbeam: {
    tvl,
  }
}

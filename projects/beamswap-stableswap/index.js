const { sumTokens2 } = require('../helper/unwrapLPs')

const abi = {
  getTokens: "address[]:getTokens",
}

async function tvl(_, _b, _2, { api }) {
  const pools = [
    '0xE3f59aB3c37c33b6368CDF4f8AC79644011E402C', //  multichain 3 pool
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

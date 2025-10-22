const { sumTokens2 } = require('../helper/unwrapLPs')

const abi = {
  getTokens: "address[]:getTokens",
}

async function tvl(api) {
  const pools = [
    '0x62bf12869E145A862218eE7e28F942Cc7FaeC460', //  base 4 pool
  ]

  const tokens = await api.multiCall({
    abi: abi.getTokens, calls: pools,
  })

  const ownerTokens = tokens.map((v, i) => [v, pools[i]])
  return sumTokens2({ api, ownerTokens, })
}

module.exports = {
  kava: {
    tvl,
  },
  deadFrom: "2023-08-13",
}

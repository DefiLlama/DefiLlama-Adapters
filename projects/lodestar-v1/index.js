const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const controller = '0xa86dd95c210dd186fa7639f93e4177e97d057576'
const cETHER = '0x2193c45244AF12C280941281c8aa67dD08be0a64'.toLowerCase()

async function getMarkets(api) {
  let markets = await api.call({ target: controller, abi: abis.getAllMarkets,  })
  markets = markets.filter(i => i.toLowerCase() !== cETHER)

  const tokens = await api.multiCall({
    abi: abis.underlying,
    calls: markets,
  })

  markets.push(cETHER)
  tokens.push(nullAddress)
  return { markets, tokens }
}

async function tvl(api) {
  const { markets, tokens } = await getMarkets(api)
  const tokensAndOwners = tokens.map((t, i) => ([t, markets[i]]))
  return sumTokens2({ tokensAndOwners, api, })
}

async function borrowed(api) {
  const { markets, tokens } = await getMarkets(api)
  const borrows = await api.multiCall({
    abi: abis.totalBorrows,
    calls: markets,
  })
  borrows.forEach((a, i) => api.add( tokens[i], a))
}

module.exports = {
  arbitrum: {
    tvl,
    borrowed,
  }
};

const abis = {
  getAllMarkets: "address[]:getAllMarkets",
  underlying: "address:underlying",
  totalBorrows: "uint256:totalBorrows",
}
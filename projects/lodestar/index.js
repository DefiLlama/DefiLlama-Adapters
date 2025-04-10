const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const controller = '0x92a62f8c4750D7FbDf9ee1dB268D18169235117B'
const cETHER = '0x7A472988bD094a09f045120e78Bb0cEa44558b52'.toLowerCase()

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
  hallmarks: [
    [1670630400, "pvlGLP collateral exploit"]
  ],
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
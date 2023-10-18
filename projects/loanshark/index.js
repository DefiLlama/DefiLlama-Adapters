const sdk = require('@defillama/sdk')
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const { transformBalances } = require('../helper/portedTokens')
const chain = 'scroll'
const controller = '0xEFB0697700E5c489073a9BDF7EF94a2B2bc884a5'
const cETHER = '0xF017f9CF11558d143E603d56Ec81E4E3B6d39D7F'.toLowerCase()

async function getMarkets(block) {
  let markets = await sdk.api2.abi.call({ target: controller, abi: abis.getAllMarkets, chain, block })
  markets = markets.filter(i => i.toLowerCase() !== cETHER)

  const tokens = await sdk.api2.abi.multiCall({
    abi: abis.underlying,
    calls: markets,
    chain, block,
  })

  markets.push(cETHER)
  tokens.push(nullAddress)
  return { markets, tokens }
}

async function tvl(_, _b, { scroll: block }) {
  const { markets, tokens } = await getMarkets(block)
  const tokensAndOwners = tokens.map((t, i) => ([t, markets[i]]))
  return sumTokens2({ tokensAndOwners, chain, block, })
}

async function borrowed(_, _b, { scroll: block }) {
  const { markets, tokens } = await getMarkets(block)
  const balances = {}
  const borrows = await sdk.api2.abi.multiCall({
    abi: abis.totalBorrows,
    calls: markets,
    chain, block,
  })
  borrows.forEach((a, i) => sdk.util.sumSingleBalance(balances, tokens[i], a))
  return transformBalances(chain, balances)
}

module.exports = {
  scroll: {
    tvl,
    borrowed,
  }
};

const abis = {
  getAllMarkets: "address[]:getAllMarkets",
  underlying: "address:underlying",
  totalBorrows: "uint256:totalBorrows",
}
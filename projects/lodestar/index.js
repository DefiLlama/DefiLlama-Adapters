const sdk = require('@defillama/sdk')
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const { transformBalances } = require('../helper/portedTokens')
const chain = 'arbitrum'
const controller = '0x8f2354F9464514eFDAe441314b8325E97Bf96cdc'
const cETHER = '0xb4d58c1f5870efa4b05519a72851227f05743273'.toLowerCase()

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

async function tvl(_, _b, { arbitrum: block }) {
  const { markets, tokens } = await getMarkets(block)
  const tokensAndOwners = tokens.map((t, i) => ([t, markets[i]]))
  return sumTokens2({ tokensAndOwners, chain, block, })
}

async function borrowed(_, _b, { arbitrum: block }) {
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
  hallmarks: [
    [1670630400, "pvlGLP collateral exploit"]
  ],
  arbitrum: {
    tvl,
    // borrowed,
  }
};

const abis = {
  getAllMarkets: "address[]:getAllMarkets",
  underlying: "address:underlying",
  totalBorrows: "uint256:totalBorrows",
}
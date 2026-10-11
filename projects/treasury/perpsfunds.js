const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress } = require('../helper/treasury')
const { sumTokens2 } = require('../helper/unwrapLPs')

// PerpsFunds (https://perpsfunds.fun) — permissionless perpetuals on Robinhood Chain.
// FeeVault collects the protocol's share of every trading fee (in each book's margin token) and the market listing fees
// (ETH); nothing leaves it except to its converter, PerpsFlywheel, named behind a public 7-day delay. The flywheel swaps
// the fees into PERPS (the protocol token) and splits it: burn / rewards / liquidity.
const HUB = '0x63ce687590d29fC3aa62a58Df294E0663815C61b'
const FEE_VAULT = '0x8F615420a79dcD3Fc299F85DfD2c6272ffc66680'
const FLYWHEEL = '0x67d206924019710cBCf7C559D05fAb68597881cA'
const PERPS = '0xd2F55dbDbd87b8B3858AE7950bc58E94C84e104D'
const OWNERS = [FEE_VAULT, FLYWHEEL]

async function tvl(api) {
  const marginTokens = await api.call({ abi: 'address[]:allPerpsTokens', target: HUB })
  const tokens = [nullAddress, ADDRESSES.robinhood.WETH, ADDRESSES.robinhood.USDG, ...marginTokens]
    .filter((t) => t.toLowerCase() !== PERPS.toLowerCase())
  return sumTokens2({ api, owners: OWNERS, tokens })
}

async function ownTokens(api) {
  return sumTokens2({ api, owners: OWNERS, tokens: [PERPS] })
}

module.exports = {
  robinhood: { tvl, ownTokens },
}

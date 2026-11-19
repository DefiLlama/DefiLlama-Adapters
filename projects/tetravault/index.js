const ADDRESSES = require('../helper/coreAssets.json')

const RESERVE = '0x6681f24a6347772D9e0F861717C35cf462f6f194'
const SPY = '0x117cc2133c37B721F49dE2A7a74833232B3B4C0C'
const GLD = '0xC9a981FEE1F9DEc688bb123ccDeCc63D0deBFC4e'
const { USO, WETH, USDG } = ADDRESSES.robinhood

async function tvl(api) {
  return api.sumTokens({ owner: RESERVE, tokens: [SPY, GLD, USO, WETH, USDG] })
}

// USDG principal lent against escrowed TETRA (index 4 = USDG cash)
async function borrowed(api) {
  const lent = await api.call({ target: RESERVE, abi: 'function onLoan(uint256) view returns (uint256)', params: [4] })
  api.add(USDG, lent)
}

module.exports = {
  methodology: 'TVL is the SPY, GLD, USO, WETH and USDG held by the TETRAVAULT Reserve contract on Robinhood Chain, funded by bond purchases and the 4% trade tax, and redeemable pro rata by burning TETRA. Borrowed is the USDG the Reserve has lent against escrowed TETRA. Staked TETRA is not counted, since its backing is the Reserve already counted in TVL.',
  start: '2026-10-22',
  robinhood: { tvl, borrowed },
}

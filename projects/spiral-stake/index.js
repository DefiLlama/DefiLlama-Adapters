const { getLogs2 } = require('../helper/cache/getLogs')

// Spiral Stake opens leveraged positions on Morpho Blue in a single transaction: flash-borrow the
// loan token, swap to collateral, supply collateral, borrow against it, repay the flash loan.
// Every position is held by its own UserProxy clone, so the Morpho collateral/debt sits under the
// proxy rather than the user's address.
//
// Discovery: LeveragePositionOpened gives every user that has ever opened a position, and
// FlashLeverage itself is the registry of their positions (market + proxy).
const config = {
  ethereum: {
    flashLeverage: '0x2B12066ebD67A6A58E70b37051AbED0590E5A721',
    morpho: '0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb',
    fromBlock: 25327266,
  },
  robinhood: {
    flashLeverage: '0x27eaF95d39cB07d544026167365689C34B4d3f9A',
    morpho: '0x9D53d5E3bd5E8d4Cbfa6DB1ca238AEA02E651010',
    fromBlock: 1244405,
  },
}

const abis = {
  LeveragePositionOpened: 'event LeveragePositionOpened(address indexed user, uint256 indexed positionId, uint256 indexed amountDepositedInLoanToken, uint256 amountCollateral)',
  getUserLeveragePositions: 'function getUserLeveragePositions(address user) view returns ((bool open, bytes32 marketId, address userProxy, uint256 amountDepositedInLoanToken, uint256 amountReturnedInLoanToken)[])',
  idToMarketParams: 'function idToMarketParams(bytes32) view returns (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv)',
  getMorphoPosition: 'function getMorphoPosition(address user, (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv) market) view returns ((uint256 supplyShares, uint128 borrowShares, uint128 collateral))',
  getSharesValueInLoanToken: 'function getSharesValueInLoanToken((address loanToken, address collateralToken, address oracle, address irm, uint256 lltv) market, uint256 borrowShares) view returns (uint256)',
}

// Returns one entry per live position: its market params, Morpho collateral and debt in loan-token
// units. Debt is resolved through the protocol's own share->assets conversion so it matches what a
// close would actually have to repay.
async function getPositions(api) {
  const { flashLeverage, morpho, fromBlock } = config[api.chain]

  const logs = await getLogs2({ api, target: flashLeverage, eventAbi: abis.LeveragePositionOpened, fromBlock })
  const users = [...new Set(logs.map(i => i.user.toLowerCase()))]
  if (!users.length) return []

  const positionLists = await api.multiCall({ target: flashLeverage, abi: abis.getUserLeveragePositions, calls: users })
  const positions = positionLists.flat().filter(i => i.open && i.userProxy !== nullAddress)
  if (!positions.length) return []

  const marketIds = [...new Set(positions.map(i => i.marketId))]
  const marketParams = await api.multiCall({ target: morpho, abi: abis.idToMarketParams, calls: marketIds })
  const marketById = {}
  marketIds.forEach((id, i) => {
    const { loanToken, collateralToken, oracle, irm, lltv } = marketParams[i]
    marketById[id] = [loanToken, collateralToken, oracle, irm, lltv]
  })

  const morphoPositions = await api.multiCall({
    target: flashLeverage, abi: abis.getMorphoPosition,
    calls: positions.map(i => ({ params: [i.userProxy, marketById[i.marketId]] })),
  })
  const debts = await api.multiCall({
    target: flashLeverage, abi: abis.getSharesValueInLoanToken,
    calls: positions.map((i, idx) => ({ params: [marketById[i.marketId], morphoPositions[idx].borrowShares] })),
  })

  return positions.map((i, idx) => ({
    collateralToken: marketById[i.marketId][1],
    loanToken: marketById[i.marketId][0],
    collateral: morphoPositions[idx].collateral,
    debt: debts[idx],
  }))
}

const nullAddress = '0x0000000000000000000000000000000000000000'

// Only the user's own margin is new value in the underlying Morpho market — the leveraged portion is
// flash-borrowed and immediately repaid out of the Morpho borrow — so the debt is netted off here
// and reported separately under `borrowed`.
const tvl = async (api) => {
  const positions = await getPositions(api)
  positions.forEach(({ collateralToken, loanToken, collateral, debt }) => {
    api.add(collateralToken, collateral)
    api.add(loanToken, -debt)
  })
}

const borrowed = async (api) => {
  const positions = await getPositions(api)
  positions.forEach(({ loanToken, debt }) => api.add(loanToken, debt))
}

module.exports = {
  start: '2026-06-16',
  doublecounted: true,
  methodology: 'Spiral Stake opens leveraged positions on Morpho Blue markets. Each position is held by a dedicated UserProxy contract that supplies collateral to and borrows from a Morpho market. TVL counts the collateral held across all open Spiral positions minus the debt owed to Morpho, i.e. only the user margin, since the leveraged portion is flash-borrowed and immediately repaid out of the Morpho borrow. Debt is reported separately as borrowed. The collateral is also counted in Morpho Blue TVL, so this listing is flagged as doublecounted.',
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl, borrowed }
})

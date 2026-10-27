const { ethers } = require('ethers')
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')
const { getUniqueAddresses } = require('../helper/tokenMapping')
const { toAssetsDown, toAssetsUp } = require('../helper/morpoho')
const morphoAbi = require('../helper/abis/morpho.json').morphoBlueFunctions

const MORPHO = '0xBBBBBbbBbb9CC5e90e3b3Af64bdAF62C37EEFFCb'
const WYLDS = '0x6aD038cA6C04e885630851278ca0a856Ad9a66Cc'
const ISSUANCE_VAULT = '0xbb03549117e38103589774ae1d6338d1b237ffa2'
const EXECUTOR = '0x43bC5fB52A618F0F2efb0d68Cf900Bb2FbD8a501'
const STRATEGY = '0x9A1dE53C14215272ae4dCFE35a650fd7151dc403'
const FROM_BLOCK = 25999777 // STRATEGY deploy

const eventAbis = {
  supplyCollateral: 'event SupplyCollateral(bytes32 indexed id, address indexed caller, address indexed onBehalf, uint256 assets)',
  supply: 'event Supply(bytes32 indexed id, address indexed caller, address indexed onBehalf, uint256 assets, uint256 shares)',
}

const onBehalf = ethers.zeroPadValue(STRATEGY.toLowerCase(), 32)

async function getPositions(api) {
  const [collateralLogs, supplyLogs] = await Promise.all([
    getLogs2({
      api, target: MORPHO, fromBlock: FROM_BLOCK, extraKey: 'supply-collateral',
      eventAbi: eventAbis.supplyCollateral,
      topics: [ethers.id('SupplyCollateral(bytes32,address,address,uint256)'), null, null, onBehalf],
    }),
    getLogs2({
      api, target: MORPHO, fromBlock: FROM_BLOCK, extraKey: 'supply',
      eventAbi: eventAbis.supply,
      topics: [ethers.id('Supply(bytes32,address,address,uint256,uint256)'), null, null, onBehalf],
    }),
  ])

  const ids = [...new Set([...collateralLogs, ...supplyLogs].map(i => i.id.toLowerCase()))]
  if (!ids.length) return []

  const [params, markets, positions] = await Promise.all([
    api.multiCall({ target: MORPHO, abi: morphoAbi.idToMarketParams, calls: ids }),
    api.multiCall({ target: MORPHO, abi: morphoAbi.market, calls: ids }),
    api.multiCall({ target: MORPHO, abi: morphoAbi.position, calls: ids.map(id => ({ params: [id, STRATEGY] })) }),
  ])

  return ids.map((_, i) => ({ params: params[i], market: markets[i], position: positions[i] }))
}

const debtOf = ({ market, position }) => toAssetsUp(position.borrowShares, market.totalBorrowAssets, market.totalBorrowShares)

async function tvl(api) {
  const positions = await getPositions(api)

  positions.forEach(({ params, market, position }) => {
    if (BigInt(position.collateral) > 0n) api.add(params.collateralToken, position.collateral)
    if (BigInt(position.supplyShares) > 0n)
      api.add(params.loanToken, toAssetsDown(position.supplyShares, market.totalSupplyAssets, market.totalSupplyShares).toString())
  })

  const tokens = getUniqueAddresses(positions.flatMap(i => [i.params.loanToken, i.params.collateralToken]).concat([WYLDS, ADDRESSES.ethereum.USDC]), api.chain)
  await sumTokens2({ api, owners: [ISSUANCE_VAULT, EXECUTOR, STRATEGY], tokens })
  positions.forEach(p => api.add(p.params.loanToken, (-debtOf(p)).toString()))
}

async function borrowed(api) {
  const positions = await getPositions(api)
  positions.forEach(p => api.add(p.params.loanToken, debtOf(p).toString()))
}

module.exports = {
  doublecounted: true,
  start: '2026-10-12',
  methodology:
    'TVL is the Hastra PRIME/AUTO collateral the Hastra Optimizer strategy holds on Morpho Blue, plus any loan assets it supplies and the balances idle in the issuance vault and executor, less its outstanding Morpho debt. The strategy loops PRIME/AUTO against borrowed stablecoins, so netting the debt leaves the vault NAV that backs the tranches. Marked doublecounted: the same collateral is counted under Morpho, and PRIME/AUTO are already tracked as Hastra RWA assets.',
  ethereum: { tvl, borrowed },
}

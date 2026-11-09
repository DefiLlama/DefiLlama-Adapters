const { ethers } = require('ethers')
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')
const { getUniqueAddresses } = require('../helper/tokenMapping')
const { toAssetsDown, toAssetsUp } = require('../helper/morpoho')
const morphoAbi = require('../helper/abis/morpho.json').morphoBlueFunctions

const MORPHO = '0xBBBBBbbBbb9CC5e90e3b3Af64bdAF62C37EEFFCb'
const WYLDS = '0x6aD038cA6C04e885630851278ca0a856Ad9a66Cc'
const AUTO = '0x997E2Efbce91D170B00EA402e35a66C887EE1da9'
const PRIME = '0x19ebb35279A16207Ec4ba82799CC64715065F7F6'
const PYUSD = '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8'
const AUSD = '0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a'
const IDLE_TOKENS = [WYLDS, AUTO, PRIME, PYUSD, AUSD, ADDRESSES.ethereum.USDC]
const ISSUANCE_VAULT = '0xbb03549117e38103589774ae1d6338d1b237ffa2'
const EXECUTOR = '0x43bC5fB52A618F0F2efb0d68Cf900Bb2FbD8a501'
const STRATEGY = '0x9A1dE53C14215272ae4dCFE35a650fd7151dc403'
// Satellite wallets of the same strategy: two automated loopers with their own
// Morpho positions, and the wallet funds sit in while bridging to/from Solana.
const PRIME_LOOPER = '0xC9DDDA6591c8f639716dDc15c55589695Eac326C'
const AUTO_LOOPER = '0xdF6C675700a22fC83e01EEcfdAaAC7E9bB49FF29'
const SOLANA_BRIDGE = '0x8D6f5f37350672c329157A8B3Eee96D6148a7A24'
const MORPHO_USERS = [STRATEGY, PRIME_LOOPER, AUTO_LOOPER]
const OWNERS = [ISSUANCE_VAULT, EXECUTOR, SOLANA_BRIDGE, ...MORPHO_USERS]
const FROM_BLOCK = 25999777 // STRATEGY deploy

const eventAbis = {
  supplyCollateral: 'event SupplyCollateral(bytes32 indexed id, address indexed caller, address indexed onBehalf, uint256 assets)',
  supply: 'event Supply(bytes32 indexed id, address indexed caller, address indexed onBehalf, uint256 assets, uint256 shares)',
}

async function getPositions(api) {
  const marketIdsOf = async (user) => {
    const onBehalf = ethers.zeroPadValue(user.toLowerCase(), 32)
    // STRATEGY keeps the original cache keys so the already-built log cache stays in use
    const keySuffix = user === STRATEGY ? '' : `-${user.toLowerCase()}`
    const [collateralLogs, supplyLogs] = await Promise.all([
      getLogs2({
        api, target: MORPHO, fromBlock: FROM_BLOCK, extraKey: `supply-collateral${keySuffix}`,
        eventAbi: eventAbis.supplyCollateral,
        topics: [ethers.id('SupplyCollateral(bytes32,address,address,uint256)'), null, null, onBehalf],
      }),
      getLogs2({
        api, target: MORPHO, fromBlock: FROM_BLOCK, extraKey: `supply${keySuffix}`,
        eventAbi: eventAbis.supply,
        topics: [ethers.id('Supply(bytes32,address,address,uint256,uint256)'), null, null, onBehalf],
      }),
    ])
    const ids = [...new Set([...collateralLogs, ...supplyLogs].map(i => i.id.toLowerCase()))]
    return ids.map(id => ({ id, user }))
  }

  const idPairs = (await Promise.all(MORPHO_USERS.map(marketIdsOf))).flat()
  if (!idPairs.length) return []
  const ids = [...new Set(idPairs.map(i => i.id))]

  const [params, markets, positions] = await Promise.all([
    api.multiCall({ target: MORPHO, abi: morphoAbi.idToMarketParams, calls: ids }),
    api.multiCall({ target: MORPHO, abi: morphoAbi.market, calls: ids }),
    api.multiCall({ target: MORPHO, abi: morphoAbi.position, calls: idPairs.map(({ id, user }) => ({ params: [id, user] })) }),
  ])
  const marketById = {}
  ids.forEach((id, i) => marketById[id] = { params: params[i], market: markets[i] })
  return idPairs.map(({ id }, i) => ({ ...marketById[id], position: positions[i] }))
}

const debtOf = ({ market, position }) => toAssetsUp(position.borrowShares, market.totalBorrowAssets, market.totalBorrowShares)

async function tvl(api) {
  const positions = await getPositions(api)

  positions.forEach(({ params, market, position }) => {
    if (BigInt(position.collateral) > 0n) api.add(params.collateralToken, position.collateral)
    if (BigInt(position.supplyShares) > 0n)
      api.add(params.loanToken, toAssetsDown(position.supplyShares, market.totalSupplyAssets, market.totalSupplyShares).toString())
  })

  const tokens = getUniqueAddresses(positions.flatMap(i => [i.params.loanToken, i.params.collateralToken]).concat(IDLE_TOKENS), api.chain)
  await sumTokens2({ api, owners: OWNERS, tokens })
  positions.forEach(p => api.add(p.params.loanToken, (-debtOf(p)).toString()))
}

async function borrowed(api) {
  const positions = await getPositions(api)
  positions.forEach(p => api.add(p.params.loanToken, debtOf(p).toString()))
}

module.exports = {
  doublecounted: true,
  timetravel: false,
  start: '2026-10-12',
  methodology:
    'TVL is the Hastra PRIME/AUTO collateral the Hastra Optimizer strategy holds on Morpho Blue, plus any loan assets it supplies and the balances idle in the issuance vault, executor and strategy wallets (including the satellite loopers and Ethereum bridge wallet), less its outstanding Morpho debt. The strategy loops PRIME/AUTO against borrowed stablecoins, so netting the debt leaves the vault NAV that backs the tranches. Solana adds SPL and Token-2022 balances of the strategy wallet plus Kamino collateral redeemed at reserve exchange rates, less Kamino debt adjusted to reserve cumulative borrow rates. Native SOL reserved for gas is excluded. Marked doublecounted: the same collateral is counted under Morpho or Kamino, and PRIME/AUTO are already tracked as Hastra RWA assets.',
  ethereum: { tvl, borrowed },
  solana: require('./solana'),
}

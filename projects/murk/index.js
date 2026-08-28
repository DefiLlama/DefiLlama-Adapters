const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getUniqueAddresses } = require('../helper/tokenMapping')
const morphoAbi = require('../helper/abis/morpho.json')

// Chain 143 (Monad mainnet). Every shielded asset is custodied by the MurkPool proxy itself; the
// connectors are single-transaction pass-throughs and hold nothing.
const POOL = '0x851DA49CA836d318977De6A0bD999b8A5CDAFBAa'
const AAVE_VAULT_FACTORY = '0x8fA4Ab28f3Ec70247B6C098d665C5F20f83B3533'
const ERC4626_CONNECTOR = '0x49E7B7E73eF26b65fc882069744086b412aa887C'
const MARKET_TOKEN_FACTORY = '0x1fcbFC3D5f1E0E82953C45D0213bB6D753566813'
const POSITION_FACTORY = '0xf01923921c7a7fEf6C43a0C366F191722518E97F'
const BORROW_CONNECTOR = '0x6da6DB8498748Bf7a1427daa28968A467e09047C' // also the position ERC721 collection
const MORPHO = '0xD5D960E8C380B724a48AC59E2DfF1b2CB4a1eAee'

// MurkPool proxy deploy tx 0x57ae0b90f1d8dc587524ccf1ab2d9d70c757cccb3f6566ef7c92939d8153d6f8
const POOL_START_BLOCK = 96149579

const eventAbis = {
  depositPending: 'event DepositPending(bytes32[] commitments, bytes32[] noteHashes, address indexed depositor, address[] tokens, uint256[] amounts, uint8[] kinds, uint256[] tokenIds)',
  withdraw: 'event Withdraw(address indexed recipient, address indexed token, uint256 amount, uint8 kind, uint256 tokenId)',
  vaultCreatedAndSeeded: 'event VaultCreatedAndSeeded(address indexed vault, address indexed asset, address indexed seedReceiver, address owner, uint256 seedAssets, uint256 seedShares)',
  erc4626Deposit: 'event ERC4626Deposit(address indexed vault, address indexed asset, uint256 assets, uint256 shares)',
  marketTokenCreated: 'event MarketTokenCreated(bytes32 indexed marketId, address indexed marketToken, address indexed loanToken)',
  positionCreated: 'event PositionCreated(bytes32 indexed marketId, address indexed position, bytes32 indexed salt, bytes32 positionOwnerBlindedHash)',
}

const abis = {
  asset: 'address:asset',
  loanToken: 'address:loanToken',
  convertToAssets: 'function convertToAssets(uint256 shares) view returns (uint256)',
  ownerOf: 'function ownerOf(uint256 tokenId) view returns (address)',
  // morpho.json has idToMarketParams and market but no position(bytes32,address)
  morphoPosition: 'function position(bytes32 id, address user) view returns (uint256 supplyShares, uint128 borrowShares, uint128 collateral)',
}

// Every getLogs call needs its own extraKey: the cache key is `${chain}/${target}`, so two calls on
// the same contract would otherwise share one cache entry and parse each other's logs.
const logsFrom = (api, target, eventAbi, extraKey) =>
  getLogs2({ api, target, eventAbi, extraKey, fromBlock: POOL_START_BLOCK })

// Deposits are permissionless for any ERC20/ERC721 and there is no on-chain allowlist, so the asset
// set is discovered by log replay. Every connector re-shields its output through pool.deposit(), so
// DepositPending sees swap outputs, vault shares, market tokens and borrow proceeds alike. A raw
// ERC20 transfer into the pool emits nothing and is therefore correctly ignored.
async function getAssets(api) {
  const [deposits, withdrawals, aaveVaults, connectorVaults, createdMarketTokens] = await Promise.all([
    logsFrom(api, POOL, eventAbis.depositPending, 'deposit-pending'),
    logsFrom(api, POOL, eventAbis.withdraw, 'withdraw'),
    logsFrom(api, AAVE_VAULT_FACTORY, eventAbis.vaultCreatedAndSeeded, 'aave-vault-created'),
    logsFrom(api, ERC4626_CONNECTOR, eventAbis.erc4626Deposit, 'erc4626-deposit'),
    logsFrom(api, MARKET_TOKEN_FACTORY, eventAbis.marketTokenCreated, 'market-token-created'),
  ])

  // tokens/kinds are non-indexed dynamic arrays decoded from the data blob. AssetKind.ERC721 (1)
  // entries are dropped: note NFTs and the position NFT have no fungible balance to sum.
  const seen = []
  deposits.forEach(log => {
    const tokens = [...log.tokens]
    const kinds = [...log.kinds]
    tokens.forEach((token, i) => { if (Number(kinds[i]) === 0) seen.push(token) })
  })
  withdrawals.forEach(log => { if (Number(log.kind) === 0) seen.push(log.token) })

  // The pool has no receive()/payable path and never holds native MON.
  const erc20s = getUniqueAddresses(seen, api.chain).filter(i => i !== ADDRESSES.null)
  const vaults = getUniqueAddresses([...aaveVaults, ...connectorVaults].map(i => i.vault), api.chain)
  const marketTokens = getUniqueAddresses(createdMarketTokens.map(i => i.marketToken), api.chain)

  return { erc20s, vaults, marketTokens }
}

// balanceOf(pool) -> convertToAssets(balance), deliberately never totalAssets(): Murk is one
// depositor among many in the Morpho curator vaults, and the Murk Aave vaults carry seed capital
// that is not Murk's, so totalAssets() would credit Murk with other people's assets. Booking the
// share balance 1:1 as the asset would ignore the exchange rate instead.
async function unwrapShares(api, shares, assetAbi) {
  if (!shares.length) return
  const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: shares.map(target => ({ target, params: POOL })) })
  const held = shares.filter((_, i) => balances[i] > 0)
  const heldBalances = balances.filter(i => i > 0)
  if (!held.length) return

  const [underlyings, amounts] = await Promise.all([
    api.multiCall({ abi: assetAbi, calls: held}),
    api.multiCall({ abi: abis.convertToAssets, calls: held.map((target, i) => ({ target, params: heldBalances[i] })) }),
  ])
  held.forEach((_, i) => {
    if (underlyings[i] && amounts[i]) api.add(underlyings[i], amounts[i])
  })
}

async function getPositions(api) {
  const created = await logsFrom(api, POSITION_FACTORY, eventAbis.positionCreated, 'position-created')
  if (!created.length) return []

  const positions = created.map(i => ({ position: i.position, marketId: i.marketId }))
  const owners = await api.multiCall({
    target: BORROW_CONNECTOR, abi: abis.ownerOf,
    calls: positions.map(i => BigInt(i.position).toString()), // tokenId == uint256(uint160(position))
  })
  const held = positions.filter((_, i) => owners[i] && owners[i].toLowerCase() === POOL.toLowerCase())
  if (!held.length) return []

  const state = await api.multiCall({ target: MORPHO, abi: abis.morphoPosition, calls: held.map(i => ({ params: [i.marketId, i.position] })) })
  return held.map((i, idx) => ({ ...i, borrowShares: state[idx].borrowShares, collateral: state[idx].collateral }))
}

// Morpho SharesMathLib.toAssetsUp with VIRTUAL_ASSETS = 1 and VIRTUAL_SHARES = 1e6. These are 128-bit
// values, so the arithmetic stays in BigInt.
function toAssetsUp(shares, totalAssets, totalShares) {
  const numerator = BigInt(shares) * (BigInt(totalAssets) + 1n)
  const denominator = BigInt(totalShares) + 1000000n
  return (numerator + denominator - 1n) / denominator
}

// Morpho debt per position
async function positionDebt(api, positions) {
  const withDebt = positions.filter(i => BigInt(i.borrowShares) > 0n)
  if (!withDebt.length) return []
  const marketIds = withDebt.map(i => i.marketId)
  const [params, markets] = await Promise.all([
    api.multiCall({ target: MORPHO, abi: morphoAbi.morphoBlueFunctions.idToMarketParams, calls: marketIds }),
    api.multiCall({ target: MORPHO, abi: morphoAbi.morphoBlueFunctions.market, calls: marketIds }),
  ])
  return withDebt.map((i, idx) => ({
    loanToken: params[idx].loanToken,
    assets: toAssetsUp(i.borrowShares, markets[idx].totalBorrowAssets, markets[idx].totalBorrowShares),
  }))
}

async function tvl(api) {
  const { erc20s, vaults, marketTokens } = await getAssets(api)

  await unwrapShares(api, vaults, abis.asset)
  await unwrapShares(api, marketTokens, abis.loanToken)

  const positions = await getPositions(api)

  const collateral = positions.filter(i => BigInt(i.collateral) > 0n)
  if (collateral.length) {
    const params = await api.multiCall({ target: MORPHO, abi: morphoAbi.morphoBlueFunctions.idToMarketParams, calls: collateral.map(i => i.marketId) })
    collateral.forEach((i, idx) => api.add(params[idx].collateralToken, i.collateral))
  }

  // Receipt tokens necessarily pass through pool.deposit(), so they are in the deposit universe as
  // well as in their own bucket - blacklisting them here is what stops the double count.
  await sumTokens2({ api, owner: POOL, tokens: erc20s, blacklistedTokens: [...vaults, ...marketTokens] })

  const debts = await positionDebt(api, positions)
  debts.forEach(d => api.add(d.loanToken, (-d.assets).toString()))
}

async function borrowed(api) {
  const debts = await positionDebt(api, await getPositions(api))
  debts.forEach(d => api.add(d.loanToken, d.assets.toString()))
}

const methodology = 'TVL is the value of the assets custodied by the MurkPool shielded pool. ' +
'Deposits are permissionless and there is no on-chain token allowlist, so the asset set is built from DepositPending and Withdraw logs. ' +
'Receipt tokens the pool holds are unwrapped to their underlying rather than counted as themselves: Murk Aave V3 vault shares, Morpho Vault V2, and MurkMorphoMarketToken shares via the ERC4626 exchange rate. Those addresses are excluded from the plain token sum so nothing is counted twice. ' +
'Morpho borrow positions are held as ERC721 clones; a position counts only while the pool still owns its NFT, and contributes its Morpho collateral to tvl. ' +
'Murk re-shields its borrow proceeds back into the pool, so the outstanding debt is netted out of tvl to avoid double counting; borrowed is reported separately.'

module.exports = {
  methodology,
  doublecounted: true,
  misrepresentedTokens: true,
  start: '2026-08-15', // block 96149579
  monad: { tvl, borrowed },
}

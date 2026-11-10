const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2, unwrapUniswapV3NFT } = require('../helper/unwrapLPs')

// Flowlex is non-custodial. Two products, both on Uniswap V3:
//  - Manual positions: users open them through the LP manager, a pass-through helper that holds no
//    funds and sends the position NFT straight to the user's own smart wallet. Those wallets can hold
//    other Uniswap positions, so we count only the token ids the manager itself minted (it emits them).
//  - Auto Vaults: single-owner vaults created by the vault factory; each one holds its position NFTs
//    and idle tokens, all of which are counted.
// Closed positions are dropped: withdraw leaves zero liquidity and burn removes the NFT.
const config = {
  base: {
    manager: '0xE20435aC8160aa58ADea4A1fc5641bB5aDAED053',
    managerFromBlock: 44474281,
    vaultFactory: '0x002dADf330A4746ac16c21f1B0828396AcF132c1',
    vaultFactoryFromBlock: 46821794,
    nfpm: '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1', // Uniswap V3 NonfungiblePositionManager
    idleTokens: [ADDRESSES.base.USDC, ADDRESSES.base.WETH, ADDRESSES.base.cbBTC],
  },
}

const abis = {
  positionOpened: 'event PositionOpened(address indexed user, uint256 indexed tokenId, address pool, uint256 depositAmount, uint256 commission)',
  positionRebalanced: 'event PositionRebalanced(address indexed user, uint256 indexed oldTokenId, uint256 indexed newTokenId)',
  vaultCreated: 'event VaultCreated(address indexed user, address indexed vault)',
  tokenOfOwnerByIndex: 'function tokenOfOwnerByIndex(address, uint256) view returns (uint256)',
}

async function managerTokenIds(api, { manager, managerFromBlock }) {
  const [opened, rebalanced] = await Promise.all([
    getLogs({ api, target: manager, eventAbi: abis.positionOpened, fromBlock: managerFromBlock, onlyArgs: true }),
    getLogs({ api, target: manager, eventAbi: abis.positionRebalanced, fromBlock: managerFromBlock, onlyArgs: true }),
  ])
  return [...opened.map(i => i.tokenId), ...rebalanced.map(i => i.newTokenId)].map(String)
}

async function getVaults(api, { vaultFactory, vaultFactoryFromBlock }) {
  const logs = await getLogs({ api, target: vaultFactory, eventAbi: abis.vaultCreated, fromBlock: vaultFactoryFromBlock, onlyArgs: true })
  return logs.map(i => i.vault)
}

async function vaultTokenIds(api, vaults, nfpm) {
  const counts = await api.multiCall({ abi: 'erc20:balanceOf', target: nfpm, calls: vaults })
  const calls = []
  vaults.forEach((vault, i) => {
    for (let j = 0; j < Number(counts[i]); j++) calls.push({ params: [vault, j] })
  })
  const ids = await api.multiCall({ abi: abis.tokenOfOwnerByIndex, target: nfpm, calls })
  return ids.map(String)
}

async function tvl(api) {
  const cfg = config[api.chain]
  const [managerIds, vaults] = await Promise.all([managerTokenIds(api, cfg), getVaults(api, cfg)])
  const vaultIds = vaults.length ? await vaultTokenIds(api, vaults, cfg.nfpm) : []

  // A manual position can be moved into a vault later; the set keeps it from being counted twice.
  const allIds = [...new Set([...managerIds, ...vaultIds])]

  // Burned NFTs revert on positions(), so keep only ids that still exist.
  const owners = await api.multiCall({ abi: 'function ownerOf(uint256) view returns (address)', target: cfg.nfpm, calls: allIds, permitFailure: true })
  const positionIds = allIds.filter((_, i) => owners[i])

  if (positionIds.length)
    await unwrapUniswapV3NFT({ api, nftAddress: cfg.nfpm, uniV3ExtraConfig: { positionIds } })

  if (vaults.length)
    await sumTokens2({ api, owners: vaults, tokens: cfg.idleTokens })
}

module.exports = {
  doublecounted: true,
  methodology:
    'Counts the Uniswap V3 liquidity opened through Flowlex. Manual positions are the position NFTs minted by the Flowlex LP manager ' +
    '(found by its PositionOpened and PositionRebalanced events); they sit in the users\' own smart wallets, and other Uniswap ' +
    'positions in those wallets are not counted. Auto Vaults are the single-owner vaults created by the Flowlex vault factory; ' +
    'their position NFTs and idle token balances are counted. Each position is valued from its liquidity at the pool\'s current price. ' +
    'Closed and burned positions are excluded. Double counted with Uniswap V3.',
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})

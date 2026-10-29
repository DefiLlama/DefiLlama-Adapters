const ADDRESSES = require('../helper/coreAssets.json')
const { unwrapSolidlyVeNft } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

const USDG = ADDRESSES.robinhood.USDG
const UP = '0x57C0E45cB534413D1C20A4240955d6bB250BB4F1'
const LUTE = '0xD1e861CC5Eee7eA88649206b74504D78CCD7AEeA'

const VE_UP = '0x5d321dE36F0bf98D92b291280514F3878582B7B6'
const VE_LUTE = '0xc1a79e3A7b04c3f21C6409a78Ab58A8C822bE7dC'

const MARKETS = [
  {
    vault: '0xd42174d3Db28B0fA2BD25381c3521b18AE9dB490',
    escrow: '0x79FA72C442ED6beFB1FD5166fe929Ca72E8E9279',
    veNft: VE_UP,
    baseToken: UP,
  },
  {
    vault: '0x747D9aFB9FB5488ccd0886e6A83eB46413010b4c',
    escrow: '0xcD84E5956d2FeE7c4041A2b6fC0212AD60762e06',
    veNft: VE_LUTE,
    baseToken: LUTE,
    isAltAbi: true,
    lockedAbi: 'function getNftState(uint256 tokenId) view returns (tuple(int128 amount,uint256 end,bool isPermanent))',
  },
]

const FABLES = '0xb63d07CEf74bE747231d601bb2FAa6B252c68106'
// veFABLES has no owner enumeration, so escrowed token ids come from the escrow's Deposited logs
const VE_FABLES = '0xc1d5aDc963a57d24ADaf63aaE1bFbeCaB95f6EDD'
const FABLES_MARKET = {
  vault: '0x459d111C968d64d5cD7A948ea2D8F1857E0B8DE0',
  escrow: '0x9E634A624F689Be41e3036F0B066B11326Ffc703',
  fromBlock: 94551020, // escrow deploy; the vault is 52 blocks older
}

async function getVaults(api) {
  const vaults = MARKETS.map(({ vault }) => vault)
  if (await api.getBlock() >= FABLES_MARKET.fromBlock) vaults.push(FABLES_MARKET.vault)
  return vaults
}

async function addVaultCash(api) {
  const vaults = await getVaults(api)
  const balances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: vaults.map(vault => ({ target: USDG, params: vault })),
  })
  balances.forEach(balance => api.add(USDG, balance))
}

// cache only the deposited token ids, not every raw log
function cacheTokenIds({ cache, logs }) {
  cache.logs = [...new Set([...cache.logs, ...logs.map(({ tokenId }) => tokenId.toString())])]
}

async function addFablesCollateral(api) {
  if (await api.getBlock() < FABLES_MARKET.fromBlock) return
  const tokenIds = await getLogs({
    api,
    target: FABLES_MARKET.escrow,
    eventAbi: 'event Deposited(address indexed owner, uint256 indexed tokenId, uint256 votingPower)',
    fromBlock: FABLES_MARKET.fromBlock,
    onlyArgs: true,
    extraKey: 'tokenIds',
    customCacheFunction: cacheTokenIds,
  })
  // ownerOf reverts once a lock is withdrawn or merged away
  const holders = await api.multiCall({ target: VE_FABLES, abi: 'function ownerOf(uint256) view returns (address)', calls: tokenIds, permitFailure: true })
  const held = tokenIds.filter((_, i) => holders[i]?.toLowerCase() === FABLES_MARKET.escrow.toLowerCase())
  const locks = await api.multiCall({ target: VE_FABLES, abi: 'function locks(uint256) view returns (uint128 amount, uint64 unlock)', calls: held })
  locks.forEach(({ amount }) => api.add(FABLES, amount))
}

async function addCollateral(api) {
  await Promise.all(MARKETS.map(market => unwrapSolidlyVeNft({
    api,
    baseToken: market.baseToken,
    veNft: market.veNft,
    owner: market.escrow,
    isAltAbi: market.isAltAbi,
    lockedAbi: market.lockedAbi,
  })))
}

async function tvl(api) {
  await addVaultCash(api)
  await addCollateral(api)
  await addFablesCollateral(api)
}

async function borrowed(api) {
  const debts = await api.multiCall({
    abi: 'uint256:totalManagedDebt',
    calls: await getVaults(api),
  })
  debts.forEach(debt => api.add(USDG, debt))
}

module.exports = {
  start: '2026-09-02',
  methodology: 'TVL is comprised of USDG deposited to the lending vaults and UP/LUTE/FABLES locked in veNFT collateral escrows. Borrowed USDG is reported separately and not counted towards TVL.',
  robinhood: { tvl, borrowed },
}

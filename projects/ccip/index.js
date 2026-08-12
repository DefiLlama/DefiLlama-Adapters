const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { PublicKey } = require('@solana/web3.js')
const { getConnection } = require('../helper/solana')
const { bs58 } = require("@project-serum/anchor/dist/cjs/utils/bytes");

//  Pool types:
//  1. Holds tokens directly: LockReleaseTokenPool, LockReleaseTokenPoolAndProxy, 
//   SiloedLockReleaseTokenPool, HybridWithExternalMinterTokenPool
//  2. Holds tokens at child contract:
//   USDCTokenPoolProxy - getPools().siloedLockReleasePool -> getAllLockboxConfigs().lockbox OR getLockBox(getSupportedChains())
//   XERC20LockBoxTokenPool - address:getLockbox
//  3. Holds tokens directly AND at child:
//   SiloedWithUnsiloedXERC20GroupTokenPool - address:getLockbox
//  4. Doesn't hold tokens (untracked): BurnMint, LombardTokenPool

const TOKEN_ADMIN_REGISTRY = {
  ethereum: '0xb22764f98dD05c789929716D677382Df22C05Cb6',
  bsc: '0x736Fd8660c443547a85e4Eaf70A49C1b7Bb008fc',
  polygon: '0x00F027eA6D0fb03256A15E9182B2B9227A4931d8',
  arbitrum: '0x39AE1032cF4B334a1Ed41cdD0833bdD7c7E7751E',
  avax: '0xc8df5D618c6a59Cc6A311E96a39450381001464F',
  base: '0x6f6C373d09C07425BaAE72317863d7F6bb731e37',
  '0g': '0x051665f2455116e929b9972c36d23070F5054Ce0',
  optimism: '0x657c42abE4CD8aa731Aec322f871B5b90cf6274F',
  linea: '0xBc933cEE67d2b1c08490ee8C51E2dF653a713534',
  era: '0x100a47C9DB342884E3314B91cec076BbAC8e619c',
  wc: '0x02Fe6ab4fb0943F58D9D925d1d2cbA9474997Ed0',
  hsk: '0x4b238f757f842280FeA88A1c2B4186b71eF8BC5E',
  sonic: '0x2961Cb47b5111F38d75f415c21ceB4120ddd1b69',
  ronin: '0x90e83d532A4aD13940139c8ACE0B93b0DdbD323a',
  shibarium: '0x995d2Aa233aBeaCA2a64Edf898AE9F4e01bE15B9',
  pharos: '0xB79791184973589c38e114D43Eb8E4588C283A18',
  bob: '0xa57d04119AFf4884F8602213E58d8AaAD18229cb',
  astar: '0xB98eEd70e3cE8E342B0f770589769E3A6bc20A09',
  bittensor_evm: '0xe72d25aDd538E8ef9CeF85622eA8912a6CB98Be6',
  hyperliquid: '0xcE44363496ABc3a9e53B3F404a740F992D977bDF',
}

const PAGE = 500

const LOCKBOX_CFG_ABI = 'function getAllLockBoxConfigs() view returns (tuple(uint64 remoteChainSelector, address lockBox)[])'
const PROXY_POOLS_ABI = 'function getPools() view returns (tuple(address cctpV1Pool, address cctpV2Pool, address cctpV2PoolWithCCV, address siloedLockReleasePool))'

async function tvl(api) {
  const registry = TOKEN_ADMIN_REGISTRY[api.chain]

  const tokens = []
  for (let start = 0; ; start += PAGE) {
    const page = await api.call({
      target: registry,
      abi: 'function getAllConfiguredTokens(uint64 startIndex, uint64 maxCount) view returns (address[])',
      params: [start, PAGE],
    })
    tokens.push(...page)
    if (page.length < PAGE) break
  }

  const pools = await api.call({
    target: registry,
    abi: 'function getPools(address[] tokens) view returns (address[])',
    params: [tokens],
  })

  const pairs = tokens
    .map((t, i) => [t, pools[i]])
    .filter(([, p]) => p && p !== ADDRESSES.null)

  const types = await api.multiCall({
    abi: 'function typeAndVersion() view returns (string)',
    calls: pairs.map(([, p]) => p),
    permitFailure: true,
  })

  const entries = pairs
    .map(([token, pool], i) => ({ token, pool, type: types[i] }))
    .filter(({ type }) => typeof type === 'string' && !/Burn|Lombard/.test(type))

  const poolList = entries.map((e) => e.pool)

  const [lockboxes, boxConfigs] = await Promise.all([
    api.multiCall({ abi: 'function getLockbox() view returns (address)', calls: poolList, permitFailure: true }),
    api.multiCall({ abi: LOCKBOX_CFG_ABI, calls: poolList, permitFailure: true }),
  ])

  const proxyIdx = entries
    .map((e, i) => (e.type.includes('USDCTokenPoolProxy') ? i : -1))
    .filter((i) => i >= 0)
  const proxyStructs = await api.multiCall({ abi: PROXY_POOLS_ABI, calls: proxyIdx.map((i) => entries[i].pool), permitFailure: true })
  const validProxies = proxyIdx
    .map((entryIdx, k) => ({ entryIdx, struct: proxyStructs[k] }))
    .filter((p) => p.struct && p.struct.siloedLockReleasePool && p.struct.siloedLockReleasePool !== ADDRESSES.null)
  const siloedConfigs = await api.multiCall({ abi: LOCKBOX_CFG_ABI, calls: validProxies.map((p) => p.struct.siloedLockReleasePool), permitFailure: true })

  const seen = new Set()
  const tokensAndOwners = []
  const add = (token, owner) => {
    if (!owner || owner === ADDRESSES.null) return
    const key = `${token}-${owner}`.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    tokensAndOwners.push([token, owner])
  }

  entries.forEach(({ token, pool }, i) => {
    add(token, pool)                                             
    add(token, lockboxes[i]) // XERC20Lockbox / hybrid Siloed child pool                                          
    if (Array.isArray(boxConfigs[i])) boxConfigs[i].forEach((c) => add(token, c.lockBox)) // siloed-with-lockbox
  })
  validProxies.forEach((p, k) => {
    const { token } = entries[p.entryIdx]
    if (Array.isArray(siloedConfigs[k])) siloedConfigs[k].forEach((c) => add(token, c.lockBox))
  })

  return sumTokens2({ api, tokensAndOwners })
}

async function solanaTvl(api) {
  const LR_PROGRAM = new PublicKey('8eqh8wppT9c5rw4ERqNCffvU6cNFJWff9WmkcYtmGiqC')
  const POOL_SIGNER_SEED  = Buffer.from('ccip_tokenpool_signer')
  // Anchor discrim. for `State` account: sha256("account:State")[0..8]
  const STATE_DISC = bs58.encode(Buffer.from('d8926b5e684bb6b1', 'hex'))
  const conn = getConnection('solana')
  const states = await conn.getProgramAccounts(LR_PROGRAM, {
    filters: [{ memcmp: { offset: 0, bytes: STATE_DISC } }],
  })

  for (const { account } of states) {
    // State layout: 8 disc + 1 version + 32 token_program + 32 mint: https://github.com/smartcontractkit/chainlink-ccip/blob/main/chains/solana/contracts/target/idl/lockrelease_token_pool.json
    const mint = new PublicKey(account.data.slice(41, 73))
    const [signer] = PublicKey.findProgramAddressSync([POOL_SIGNER_SEED, mint.toBuffer()], LR_PROGRAM)
    const toa = await conn.getTokenAccountsByOwner(signer, { mint })
    for (const a of toa.value) api.add(mint.toBase58(), a.account.data.readBigUInt64LE(64))
  }
}

module.exports = {
  methodology: 'Sums tokens locked in CCIP LockRelease TokenPools, pulled from each chain\'s TokenAdminRegistry or LockAndRelease PDAs.',
  solana: { tvl: solanaTvl }
}

Object.keys(TOKEN_ADMIN_REGISTRY).forEach(chain => {
  module.exports[chain] = { tvl };
});

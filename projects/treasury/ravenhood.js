const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const { sumTokensExport, unwrapSlipstreamNFT, unwrapUniswapV3NFT } = require('../helper/unwrapLPs')

// RavenhoodVault — permanently locked, protocol-owned RVH/WETH Uniswap V3 position
const VAULT = '0x5e1485137E025bf7774F52DE4E33fa6E498f6ede'
// DAO treasury wallet — interim EOA (moving to a multisig). Holds plain
// USDG/ETH plus DAO-owned LP positions pairing RVH against tokenized
// stocks/blue chips (the "expansion liquidity" the burn engine funds).
const DAO_WALLET = '0x097ba31b7ACfFd75B909fc7BEf2e55424d2dAcdc'
const RVH_TOKEN = '0x96765066f6a040a21EB027167D2315B707c82633'
const LUTE_TOKEN = '0xD1e861CC5Eee7eA88649206b74504D78CCD7AEeA'

// Standard Uniswap-V3-shaped position managers (positions() has a bps `fee`
// field, factory.getPool(address,address,uint24 fee)) -- resolveUniV3
// auto-discovers every position either owner holds on each, not just one pair.
const UNIV3_NFT_MANAGERS = [
  '0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3', // Uniswap V3
  '0xA79F5775b0B49E51202c48DDF03F380FaA96f641', // Giga (same Uniswap V3 ABI shape)
]

// UPDex is a Slipstream/Aerodrome-style CL fork: positions() has a pool
// `tickSpacing` where standard Uniswap V3 has `fee`, and its factory's
// getPool(address,address,int24 tickSpacing) has a DIFFERENT selector than
// the uint24-fee version the plain resolveUniV3 path calls -- mixing it into
// UNIV3_NFT_MANAGERS above makes every position on it revert ("could not
// decode result data"), confirmed via this PR's own CI run. Needs the
// dedicated Slipstream resolver (unwrapSlipstreamNFT) instead.
const UPDEX_NFT_MANAGER = '0x07F44c47743A2f36414A82b9F558ECFCf0EEdCEf'
const UPDEX_VOTER = '0x7F749fDD351C1Ceed82d76d7699CB631Eb8332a7'

// Alandale's concentrated-liquidity positions are Algebra-like NFTs, not
// Uniswap V3 NFTs. The treasury also holds one Alandale V2 volatile LP.
const ALANDALE_NFT_MANAGER = '0xe62a5F67516dBDBA2Aa28b1512C8Ff44E42cB5c3'
const ALANDALE_V2_RVH_WETH_LP = '0x1a453e60e0cb61Ea15b42064B275318fE3800873'
const ALANDALE_V2_RVH_WETH_GAUGE = '0x97C920CD393300Fb886F7E8036107F309808f050'

// veLUTE NFTs held by the DAO represent locked LUTE exposure. Count the locked
// underlying LUTE, not the non-fungible wrapper itself.
const VELUTE_NFT = '0xc1a79e3A7b04c3f21C6409a78Ab58A8C822bE7dC'

const VELUTE_STATE_ABI = 'function getNftState(uint256 tokenId) view returns (tuple(tuple(int128 amount,uint256 end,bool isPermanentLocked) locked,bool isVoted,bool isAttached,uint256 lastTranferBlock,uint256 pointEpoch))'

const lower = (v) => v.toLowerCase()

function shouldAdd(token, blacklistedTokens = [], whitelistedTokens = []) {
  token = lower(token)
  if (whitelistedTokens.length) return whitelistedTokens.map(lower).includes(token)
  return !blacklistedTokens.map(lower).includes(token)
}

const univ3Tvl = sumTokensExport({
  owners: [VAULT, DAO_WALLET],
  tokens: [ADDRESSES.robinhood.USDG, ADDRESSES.null],
  resolveUniV3: true,
  uniV3ExtraConfig: { nftAddress: UNIV3_NFT_MANAGERS },
  blacklistedTokens: [RVH_TOKEN],
})

async function updexTvl(api) {
  const balances = {}
  await Promise.all([VAULT, DAO_WALLET].map((owner) =>
    unwrapSlipstreamNFT({ api, balances, owner, nftAddress: UPDEX_NFT_MANAGER, blacklistedTokens: [RVH_TOKEN] })
  ))
  const positionIds = await getUpdexStakedPositionIds(api)
  if (positionIds.length)
    await unwrapSlipstreamNFT({ api, balances, positionIds, nftAddress: UPDEX_NFT_MANAGER, blacklistedTokens: [RVH_TOKEN] })
  return balances
}

// Staked UPDex positions leave the DAO wallet and sit in the gauge, so owner-based
// discovery misses them. Walk the voter's gauges and ask each for the DAO's stake.
// stakedLength/stakedByIndex are CL-gauge only, hence permitFailure there: 6 of the
// 93 gauges are non-CL and revert on it.
async function getUpdexStakedPositionIds(api) {
  const count = await api.call({ target: UPDEX_VOTER, abi: 'uint256:length' })
  const pools = await api.multiCall({
    target: UPDEX_VOTER,
    abi: 'function pools(uint256) view returns (address)',
    calls: Array.from({ length: Number(count) }, (_, i) => i),
  })
  const gauges = (await api.multiCall({
    target: UPDEX_VOTER,
    abi: 'function gauges(address) view returns (address)',
    calls: pools,
  })).filter(Boolean).filter((gauge) => gauge !== ADDRESSES.null)
  const lengths = await api.multiCall({
    abi: 'function stakedLength(address depositor) view returns (uint256)',
    calls: gauges.map((target) => ({ target, params: [DAO_WALLET] })),
    permitFailure: true,
  })
  const calls = []
  lengths.forEach((length, i) => {
    for (let index = 0; index < Number(length || 0); index++)
      calls.push({ target: gauges[i], params: [DAO_WALLET, index] })
  })
  if (!calls.length) return []
  return api.multiCall({
    abi: 'function stakedByIndex(address depositor,uint256 index) view returns (uint256)',
    calls,
  })
}

async function alandaleCl({ api, blacklistedTokens = [], whitelistedTokens = [] }) {
  await unwrapUniswapV3NFT({
    api,
    owner: DAO_WALLET,
    nftAddress: ALANDALE_NFT_MANAGER,
    blacklistedTokens,
    whitelistedTokens,
    isAlgebra: true,
  })
  return api.getBalances()
}

async function alandaleV2({ api, blacklistedTokens = [], whitelistedTokens = [] }) {
  const [token0, token1, totalSupply, reserves, directBalance, stakedBalance] = await Promise.all([
    api.call({ target: ALANDALE_V2_RVH_WETH_LP, abi: 'address:token0' }),
    api.call({ target: ALANDALE_V2_RVH_WETH_LP, abi: 'address:token1' }),
    api.call({ target: ALANDALE_V2_RVH_WETH_LP, abi: 'function totalSupply() view returns (uint256)' }),
    api.call({ target: ALANDALE_V2_RVH_WETH_LP, abi: 'function getReserves() view returns (uint112 reserve0,uint112 reserve1,uint32 blockTimestampLast)' }),
    api.call({ target: ALANDALE_V2_RVH_WETH_LP, abi: 'erc20:balanceOf', params: DAO_WALLET }),
    api.call({ target: ALANDALE_V2_RVH_WETH_GAUGE, abi: 'erc20:balanceOf', params: DAO_WALLET }),
  ])
  const balance = BigInt(directBalance) + BigInt(stakedBalance)
  if (!balance || !totalSupply) return api.getBalances()

  const amount0 = BigInt(reserves.reserve0) * balance / BigInt(totalSupply)
  const amount1 = BigInt(reserves.reserve1) * balance / BigInt(totalSupply)
  if (shouldAdd(token0, blacklistedTokens, whitelistedTokens)) api.add(token0, amount0)
  if (shouldAdd(token1, blacklistedTokens, whitelistedTokens)) api.add(token1, amount1)
  return api.getBalances()
}

async function veLuteTvl(api) {
  const count = await api.call({ target: VELUTE_NFT, abi: 'erc20:balanceOf', params: DAO_WALLET })
  const tokenIds = await api.multiCall({
    target: VELUTE_NFT,
    abi: 'function tokenOfOwnerByIndex(address owner,uint256 index) view returns (uint256)',
    calls: Array.from({ length: Number(count) }, (_, i) => ({ params: [DAO_WALLET, i] })),
  })
  const states = await api.multiCall({ target: VELUTE_NFT, abi: VELUTE_STATE_ABI, calls: tokenIds })
  states.forEach((state) => api.add(LUTE_TOKEN, state.locked.amount))
  return api.getBalances()
}

// uniV3WhitelistedTokens (not blacklistedTokens) is required here: the DAO
// wallet's LP positions pair RVH against many different tokens (WETH,
// VIRTUAL, MSFT, TSLA, AAPL, NVDA, SPY, PLTR, GOOGL, ...), so blacklisting
// just one quote token leaks all the others into "ownTokens". Whitelisting
// RVH itself keeps this to only the RVH side of every resolved position.
const univ3OwnTokens = sumTokensExport({
  owners: [VAULT, DAO_WALLET],
  tokens: [RVH_TOKEN],
  resolveUniV3: true,
  uniV3ExtraConfig: { nftAddress: UNIV3_NFT_MANAGERS },
  uniV3WhitelistedTokens: [RVH_TOKEN],
})

async function updexOwnTokens(api) {
  const balances = {}
  await Promise.all([VAULT, DAO_WALLET].map((owner) =>
    unwrapSlipstreamNFT({ api, balances, owner, nftAddress: UPDEX_NFT_MANAGER, whitelistedTokens: [RVH_TOKEN] })
  ))
  const positionIds = await getUpdexStakedPositionIds(api)
  if (positionIds.length)
    await unwrapSlipstreamNFT({ api, balances, positionIds, nftAddress: UPDEX_NFT_MANAGER, whitelistedTokens: [RVH_TOKEN] })
  return balances
}

module.exports = {
  robinhood: {
    tvl: sdk.util.sumChainTvls([
      univ3Tvl,
      updexTvl,
      (api) => alandaleCl({ api, blacklistedTokens: [RVH_TOKEN] }),
      (api) => alandaleV2({ api, blacklistedTokens: [RVH_TOKEN] }),
      veLuteTvl,
    ]),
    ownTokens: sdk.util.sumChainTvls([
      univ3OwnTokens,
      updexOwnTokens,
      (api) => alandaleCl({ api, whitelistedTokens: [RVH_TOKEN] }),
      (api) => alandaleV2({ api, whitelistedTokens: [RVH_TOKEN] }),
    ]),
  },
}

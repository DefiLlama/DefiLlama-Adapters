const { AbiCoder, keccak256, ZeroAddress, ZeroHash } = require('ethers')
const { getLogs2 } = require('../helper/cache/getLogs')
const config = require('./config')
const { decodeChunks, inventory } = require('./liquidity')

const coder = AbiCoder.defaultAbiCoder()
const poolKeyType = 'tuple(address currency0,address currency1,uint24 fee,int24 tickSpacing,address hooks)'
const abi = {
  v3: 'event PoolDeployed(address indexed poolAddress, address indexed uniswapPool, address collateralTracker0, address collateralTracker1, address riskEngine)',
  v4: 'event PoolDeployed(address indexed poolAddress, bytes32 indexed idV4, address collateralTracker0, address collateralTracker1, address riskEngine)',
  mint: 'event TokenizedPositionMinted(address indexed caller, uint256 indexed tokenId, uint128 positionSize)',
  liquidity: 'function getAccountLiquidity(bytes poolKey,address owner,uint256 tokenType,int24 tickLower,int24 tickUpper) view returns(uint256)',
  v3Pool: 'function getUniswapV3PoolFromId(uint64 poolId) view returns(address)',
  v4Pool: `function getUniswapV4PoolKeyFromId(uint64 poolId) view returns(${poolKeyType})`,
  v3Price: 'function slot0() view returns(uint160 sqrtPriceX96,int24 tick,uint16 observationIndex,uint16 observationCardinality,uint16 observationCardinalityNext,uint8 feeProtocol,bool unlocked)',
  v4Price: 'function getSlot0(bytes32 poolId) view returns(uint160 sqrtPriceX96,int24 tick,uint24 protocolFee,uint24 lpFee)',
}

function addresses(values) {
  return [...new Set(values.map(value => value.toLowerCase()))]
}

function add(api, token, amount) {
  if (BigInt(amount) === 0n) return
  if (token.toLowerCase() === ZeroAddress) api.addGasToken(amount.toString())
  else api.add(token, amount.toString())
}

async function readLogs(api, target, fromBlock, eventAbi, extraKey) {
  if (api.block < fromBlock) return []
  const logs = await getLogs2({ api, target, fromBlock, toBlock: api.block, eventAbi, extraKey, onlyArgs: false, skipCacheRead: true })
  return logs.filter(log => Number(log.blockNumber) >= fromBlock && Number(log.blockNumber) <= api.block)
}

async function poolCoverage(api, chain) {
  const logs = (await Promise.all(chain.factories.map(factory =>
    readLogs(api, factory.target, chain.startBlock, abi[factory.version], `pool-deployed-${factory.version}`)
  ))).flat()
  const pools = new Set(addresses(logs.map(log => log.args.poolAddress)))
  const trackers = addresses(logs.flatMap(log => [log.args.collateralTracker0, log.args.collateralTracker1]))
  const [tokens, balances] = await Promise.all([
    api.multiCall({ abi: 'function asset() external view returns(address)', calls: trackers }),
    api.multiCall({ abi: 'function totalAssets() external view returns(uint256)', calls: trackers }),
  ])
  tokens.forEach((token, index) => add(api, token, balances[index]))
  return { pools, trackers: new Set(trackers), tokens: addresses(tokens) }
}

async function vaultAssets(api, chain, coverage) {
  const vaults = [...new Map(chain.vaults.filter(vault => vault.fromBlock <= api.block).map(vault => [vault.address.toLowerCase(), vault])).values()]
  if (!vaults.length) return
  const [underlyings, accountants] = await Promise.all([
    api.multiCall({ abi: 'address:underlyingToken', calls: vaults.map(vault => vault.address) }),
    api.multiCall({ abi: 'address:accountant', calls: vaults.map(vault => vault.address) }),
  ])
  const hashes = await api.multiCall({ abi: 'function vaultHashes(address,uint256) view returns(bytes32)', calls: vaults.map((vault, index) => ({ target: accountants[index], params: [vault.address, 1] })) })
  const allocations = []
  vaults.forEach((vault, index) => {
    const receipts = vault.erc4626s.filter(receipt => receipt.fromBlock <= api.block && (receipt.toBlock === undefined || api.block < receipt.toBlock))
    if (addresses(receipts.map(receipt => receipt.address)).length !== receipts.length)
      throw new Error(`Duplicate ERC-4626 allocation for ${vault.address}`)
    const expected = keccak256(coder.encode(['address[]'], [receipts.map(receipt => receipt.address)]))
    if (hashes[index].toLowerCase() !== expected && !(receipts.length === 0 && hashes[index] === ZeroHash))
      throw new Error(`Unverified ERC-4626 allocations for ${vault.address} at ${api.block}`)
    for (const receipt of receipts) {
      if (!coverage.trackers.has(receipt.address.toLowerCase()))
        allocations.push({ target: receipt.address, owner: vault.address, underlying: underlyings[index] })
    }
  })
  const receiptTokens = new Set([...coverage.trackers, ...allocations.map(allocation => allocation.target.toLowerCase())])
  const tokens = addresses([...coverage.tokens, ...underlyings, chain.wrappedNative, ZeroAddress]).filter(token => !receiptTokens.has(token))
  await api.sumTokens({ tokensAndOwners: vaults.flatMap(vault => tokens.map(token => [token, vault.address])), permitFailure: false })
  if (!allocations.length) return
  const [assets, shares] = await Promise.all([
    api.multiCall({ abi: 'address:asset', calls: allocations.map(allocation => allocation.target) }),
    api.multiCall({ abi: 'erc20:balanceOf', calls: allocations.map(allocation => ({ target: allocation.target, params: allocation.owner })) }),
  ])
  assets.forEach((asset, index) => {
    if (asset.toLowerCase() !== allocations[index].underlying.toLowerCase() || receiptTokens.has(asset.toLowerCase()))
      throw new Error(`Unsupported ERC-4626 backing for ${allocations[index].target}`)
  })
  const balances = await api.multiCall({ abi: 'function convertToAssets(uint256) view returns(uint256)', calls: allocations.map((allocation, index) => ({ target: allocation.target, params: shares[index] })) })
  assets.forEach((asset, index) => add(api, asset, balances[index]))
}

async function sfpmAssets(api, chain, coverage) {
  for (const sfpm of chain.sfpms) {
    // Mints discover every account/range; snapshot liquidity already incorporates burns.
    const mints = await readLogs(api, sfpm.target, chain.sfpmStartBlock, abi.mint, `standalone-mints-${sfpm.version}`)
    const chunks = new Map()
    for (const log of mints) {
      const owner = log.args.caller.toLowerCase()
      if (coverage.pools.has(owner)) continue
      for (const chunk of decodeChunks(log.args.tokenId, owner))
        chunks.set([chunk.poolId, owner, chunk.tokenType, chunk.tickLower, chunk.tickUpper].join(':'), chunk)
    }
    if (!chunks.size) continue
    const poolIds = [...new Set([...chunks.values()].map(chunk => chunk.poolId))]
    const resolved = await api.multiCall({ target: sfpm.target, abi: sfpm.version === 'v3' ? abi.v3Pool : abi.v4Pool, calls: poolIds })
    const pools = new Map()
    if (sfpm.version === 'v3') {
      if (resolved.some(pool => pool.toLowerCase() === ZeroAddress)) throw new Error('Unresolved SFPM V3 pool')
      const [token0s, token1s, prices] = await Promise.all([
        api.multiCall({ abi: 'address:token0', calls: resolved }),
        api.multiCall({ abi: 'address:token1', calls: resolved }),
        api.multiCall({ abi: abi.v3Price, calls: resolved }),
      ])
      poolIds.forEach((id, index) => pools.set(id, { key: coder.encode(['address'], [resolved[index]]), token0: token0s[index], token1: token1s[index], price: prices[index].sqrtPriceX96 }))
    } else {
      const keys = resolved.map(pool => {
        if (Number(pool.tickSpacing) <= 0) throw new Error('Unresolved SFPM V4 pool')
        return coder.encode([poolKeyType], [pool])
      })
      const prices = await api.multiCall({ target: chain.stateView, abi: abi.v4Price, calls: keys.map(key => keccak256(key)) })
      poolIds.forEach((id, index) => pools.set(id, { key: keys[index], token0: resolved[index].currency0, token1: resolved[index].currency1, price: prices[index].sqrtPriceX96 }))
    }
    // Different SFPM IDs can resolve to the same underlying pool and account range.
    const ranges = [...new Map([...chunks.values()].map(chunk => {
      const pool = pools.get(chunk.poolId)
      return [[pool.key, chunk.owner, chunk.tokenType, chunk.tickLower, chunk.tickUpper].join(':'), { ...chunk, pool }]
    })).values()]
    const balances = await api.multiCall({ target: sfpm.target, abi: abi.liquidity, calls: ranges.map(chunk => ({ params: [chunk.pool.key, chunk.owner, chunk.tokenType, chunk.tickLower, chunk.tickUpper] })) })
    ranges.forEach((chunk, index) => {
      const [amount0, amount1] = inventory(balances[index], chunk.pool.price, chunk.tickLower, chunk.tickUpper)
      add(api, chunk.pool.token0, amount0)
      add(api, chunk.pool.token1, amount1)
    })
  }
}

async function tvl(api) {
  await api.getBlock()
  const chain = config[api.chain]
  const coverage = await poolCoverage(api, chain)
  await vaultAssets(api, chain, coverage)
  await sfpmAssets(api, chain, coverage)
}

module.exports = { tvl }

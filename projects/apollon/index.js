const storagePoolAbi = [{
  "constant": true,
  "inputs": [],
  "name": "checkRecoveryMode",
  "outputs": [
    { "name": "isInRecoveryMode", "type": "bool" },
    { "name": "TCR",               "type": "uint256" },
    { "name": "entireSystemColl",  "type": "uint256" },
    { "name": "entireSystemDebt",  "type": "uint256" }
  ],
  "stateMutability": "view",
  "type": "function"
}]

const swapOperationsAbi = {
  allPairsLength: {
    "inputs": [],
    "name": "allPairsLength",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  allPairs: {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "allPairs",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  }
}

const pairAbi = {
  token0: {
    "inputs": [],
    "name": "token0",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  token1: {
    "inputs": [],
    "name": "token1",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  getReserves: {
    "inputs": [],
    "name": "getReserves",
    "outputs": [
      { "internalType": "uint112", "name": "reserve0", "type": "uint112" },
      { "internalType": "uint112", "name": "reserve1", "type": "uint112" },
      { "internalType": "uint32",  "name": "blockTimestampLast", "type": "uint32" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
}

const priceFeedAbi = {
  getUSDValue: {
    "inputs": [
      { "internalType": "address", "name": "_tokenAddress", "type": "address" },
      { "internalType": "uint256", "name": "_amount", "type": "uint256" }
    ],
    "name": "getUSDValue",
    "outputs": [{ "internalType": "uint256", "name": "usdValue", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
}

// -------------------- contract addresses --------------------
const STORAGE_POOL_ADDRESS   = '0x20eD855d2c4e61F148cf90F4C5Ff84CFBCB5D99F';
const SWAP_OPERATIONS_ADDRESS = '0xf69D9cACc0140e699C6b545d166C973CB59b8E87';
const PRICE_FEED_ADDRESS      = '0xeeE9Bfdb368d22Bd0560d4713F6B585Ab1172b3C';
const DEPLOY_BLOCK            = 133986313;

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  start: DEPLOY_BLOCK,

  sei: {
    tvl,
  },
};

/**
 * TVL = System collateral (from StoragePool) + value of all reserves inside every SwapPair.
 */
async function tvl(api) {
  // ---------------------------------------------------------------------------
  // 1. System-wide collateral from the StoragePool
  // ---------------------------------------------------------------------------
  const storageRes = await api.call({ abi: storagePoolAbi[0], target: STORAGE_POOL_ADDRESS })
  const systemCollUSD = BigInt(storageRes.entireSystemColl)   // 1e18 already USD-denominated

  // ---------------------------------------------------------------------------
  // 2. Gather liquidity-pool reserves
  // ---------------------------------------------------------------------------
  // 2.1 how many pools?
  const poolCount = await api.call({ abi: swapOperationsAbi.allPairsLength, target: SWAP_OPERATIONS_ADDRESS })
  const idxArray  = [...Array(Number(poolCount)).keys()]

  // 2.2 fetch all pair addresses
  const pairAddresses = await api.multiCall({
    abi: swapOperationsAbi.allPairs,
    calls: idxArray.map(i => ({ target: SWAP_OPERATIONS_ADDRESS, params: [i] }))
  })

  // 2.3 fetch token0, token1 & reserves for every pair in parallel
  const [tokens0, tokens1, reserves] = await Promise.all([
    api.multiCall({ abi: pairAbi.token0, calls: pairAddresses }),
    api.multiCall({ abi: pairAbi.token1, calls: pairAddresses }),
    api.multiCall({ abi: pairAbi.getReserves, calls: pairAddresses }),
  ])

  // accumulate amounts per token
  const tokenBalances = {}
  for (let i = 0; i < pairAddresses.length; i++) {
    const [reserve0, reserve1] = reserves[i]
    const t0 = tokens0[i]
    const t1 = tokens1[i]

    tokenBalances[t0] = (tokenBalances[t0] || 0n) + BigInt(reserve0)
    tokenBalances[t1] = (tokenBalances[t1] || 0n) + BigInt(reserve1)
  }

  // ---------------------------------------------------------------------------
  // 3. Convert every token amount to USD via on-chain PriceFeed
  // ---------------------------------------------------------------------------
  const tokenList = Object.keys(tokenBalances)
  const usdPerToken = await api.multiCall({
    abi: priceFeedAbi.getUSDValue,
    calls: tokenList.map(t => ({ target: PRICE_FEED_ADDRESS, params: [t, tokenBalances[t].toString()] }))
  })

  let poolsUSD = 0n
  usdPerToken.forEach(val => { poolsUSD += BigInt(val) })

  // ---------------------------------------------------------------------------
  // 4. Total TVL in USD (1e18 precision).  Return as `usd-coin` so DL interprets
  //    it as already-priced USD.
  // ---------------------------------------------------------------------------
  const totalUSD = systemCollUSD + poolsUSD
  return { 'usd-coin': Number(totalUSD) / 1e18 }
}

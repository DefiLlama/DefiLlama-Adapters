const sdk = require('@defillama/sdk');
const { getCache, setCache } = require("../helper/cache")
const { sumTokens2 } = require('../helper/unwrapLPs')

const abi = {
  nextLockId: "function nextLockId() view returns (uint256)",
  locks: "function locks(uint256) view returns (uint256 lockId, address token, bool isLpToken, address pendingOwner, address owner, uint24 tgeBps, uint24 cycleBps, uint256 amount, uint256 startTime, uint256 endTime, uint256 cycle, uint256 unlockedAmount, bytes32 feeNameHash)"
}

const CONFIG = {
  base: {
    contracts: [
      {
        address: "0xF17A08A7d41F53B24AD07Eb322CBBdA2ebdeC04b",
      }
    ],
  },
  ethereum: {
    contracts: [
      {
        address: "0xF17A08A7d41F53B24AD07Eb322CBBdA2ebdeC04b",
      }
    ],
  },
  bsc: {
    contracts: [
      {
        address: "0xF17A08A7d41F53B24AD07Eb322CBBdA2ebdeC04b"
      },
      {
        address: "0x7AA03D4b9051cF299e7A2272953D0590FEE485A4"
      }
    ],
  },
  arbitrum: {
    contracts: [
      {
        address: "0xF17A08A7d41F53B24AD07Eb322CBBdA2ebdeC04b"
      }
    ],
  },
}

async function tvl(timestamp, block, chainBlocks, { api }) {
  const chain = api.chain
  const contracts = CONFIG[chain].contracts
  let totalBalances = {}

  for (const { address: contract} of contracts) {    
    const cache = await getCache('goplus-locker-v2', chain)
    if (!cache.vaults) cache.vaults = {}
    if (!cache.vaults[contract]) cache.vaults[contract] = { 
      lastLockId: 0,
      validLocks: {}
    }
    const cCache = cache.vaults[contract]

    // get lask lock id
    const totalLockId = await api.call({ target: contract, abi: abi.nextLockId })
    let startIndex = cCache.lastLockId || 0
    startIndex = 0

    const calls = Array.from({ length: totalLockId - startIndex }, (_, i) => ({ 
      target: contract, 
      params: [startIndex + i] 
    }))

    const lockInfos = await api.multiCall({ calls, abi: abi.locks })
    
    Object.entries(cCache.validLocks || {}).forEach(([lockId, lock]) => {
      if (Number(lock.endTime) <= timestamp) {
        console.log(`Cleaning expired cache:`, {
          id: lockId,
          endTime: new Date(Number(lock.endTime) * 1000).toISOString()
        })
        delete cCache.validLocks[lockId]
      }
    })

    // update cache
    lockInfos.forEach(lock => {
      if (!lock) return
      
      const lockId = lock.lockId?.toString()
      if (!lockId) return
    
      const isValid = lock.endTime && 
        Number(lock.endTime) > timestamp.timestamp && 
        BigInt(lock.amount) > BigInt(0)
    
      if (isValid) {
        cCache.validLocks[lockId] = {
          token: lock.token.toLowerCase(),
          isLpToken: lock.isLpToken,
          amount: lock.amount.toString(),
          endTime: lock.endTime.toString()
        }
      } else if (cCache.validLocks[lockId]) {
        console.log(`Removing invalid lock: ${lockId}`)
        delete cCache.validLocks[lockId]
      }
    })
    cCache.lastLockId = Math.max(totalLockId, cCache.lastLockId || 0)

    // check 
    if (!Array.isArray(lockInfos) || lockInfos.length === 0) {
      console.log('No lock infos found')
      continue
    }

    const allValidLocks = Object.entries(cCache.validLocks || {}).map(([_, lock]) => lock)

    const tokenBalances = allValidLocks.reduce((acc, lock) => {
      const amount = BigInt(lock.amount)
      const token = lock.token
      acc[token] = (acc[token] || 0n) + amount
      return acc
    }, {})

    const lpTokens = allValidLocks
      .filter(lock => 
        lock && 
        lock.isLpToken && 
        lock.token?.trim?.() &&
        typeof lock.token === 'string'
      )
      .map(lock => ({ 
        ...lock, 
        token: lock.token.toLowerCase().trim()
      }))

    if (lpTokens.length > 0) {
      const tokens = lpTokens
        .map(t => t.token)
        .filter(t => t.length === 42) 
              
      const lpBalances = await sumTokens2({
        api,
        tokens,
        owners: [contract],
        resolveLP: true,
        useDefaultCoreAssets: true,
      })

      Object.entries(lpBalances).forEach(([token, balance]) => {
        sdk.util.sumSingleBalance(totalBalances, token, balance)
      })
    }

    Object.entries(tokenBalances).forEach(([token, balance]) => {
      sdk.util.sumSingleBalance(totalBalances, `${chain}:${token}`, balance)
    })

    cCache.lastLockId = totalLockId
    await setCache('goplus-locker-v2', chain, cache)
    
  }
  return totalBalances
}

module.exports = {
  methodology: "Calculates the total value of all tokens (including LP tokens and standard ERC20 tokens) locked in the protocol's vesting contracts",
  base: { tvl },
  ethereum: { tvl },
  bsc: { tvl },
  arbitrum: { tvl },
}


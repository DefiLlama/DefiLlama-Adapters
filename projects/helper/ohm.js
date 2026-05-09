const sdk = require('@defillama/sdk')
const BigNumber = require('bignumber.js')
const { get } = require('./http')
const { staking, } = require('./staking')
const { sumTokens2 } = require('./unwrapLPs')
const ADDRESSES = require('./coreAssets.json')

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

function ohmTvl(treasury, treasuryTokens, chain = 'ethereum', stakingAddress, stakingToken) {
    const tvl = async (api) => {
        const tokens = treasuryTokens.map(t => t[0])
        return sumTokens2({ api, tokens, owner: treasury, resolveLP: true, })
    }
    return {
        [chain]: {
            tvl,
            staking: staking(stakingAddress, stakingToken)
        }
    }
}

function buildOlympusTvl({ chains, chainMap, treasuryApi, mode = 'tvl', defaultOwnTokens = [] }) {
  return async function(api) {
    const chainConfig = chains[api.chain]
    if (!chainConfig) return {}

    if (!chainConfig.fallbackOnly) {
      const directApi = new sdk.ChainApi({
        chain: api.chain,
        block: api.block,
        timestamp: api.timestamp,
        protocol: 'olympus-direct',
      })

      try {
        await directOlympusTvl(directApi, mode, chainConfig)
        const directBalances = directApi.getBalances()
        if (hasUsableBalances(directBalances)) {
          api.addBalances(directBalances)
          return api.getBalances()
        }
        console.warn(`[olympus] direct ${api.chain}/${mode} returned no usable balances; falling back to Olympus API`)
      } catch (e) {
        console.warn(`[olympus] direct ${api.chain}/${mode} failed; falling back to Olympus API: ${e.message}`)
      }
    }

    return fallbackOlympusApiTvl(api, { mode, chains, chainMap, treasuryApi, defaultOwnTokens })
  }
}

async function directOlympusTvl(api, mode, chainConfig) {
  const owners = await getOwners(api, chainConfig, mode)
  const blacklistedTokens = getBlacklist(mode, chainConfig)
  const liabilitySet = getAddressSet(chainConfig.liabilityTokens)
  const unsupportedSet = getAddressSet(chainConfig.unsupportedForDirect)
  const sourceTokens = mode === 'ownTokens' ? chainConfig.ownTokens : chainConfig.treasuryTokens
  const tokens = sourceTokens.filter(token => !liabilitySet.has(normalize(token)) && !unsupportedSet.has(normalize(token)))

  if (tokens.length && owners.length) {
    await sumTokens2({
      api,
      owners,
      tokens,
      resolveLP: true,
      permitFailure: true,
      blacklistedTokens,
    })
  }

  if (mode === 'tvl') {
    await addLiabilities(api, owners, chainConfig)
    await addSpecialPositions(api, owners, chainConfig)
  }

  api.deleteTokens(blacklistedTokens)
}

async function fallbackOlympusApiTvl(api, { mode, chains, chainMap, treasuryApi, defaultOwnTokens }) {
  const chainConfig = chains[api.chain] || {}
  const { data: records } = await get(treasuryApi)

  const chainKey = Object.keys(chainMap).find(k => chainMap[k] === api.chain)
  if (!chainKey) return {}

  const ownTokenSet = getAddressSet(chainConfig.ownTokens || defaultOwnTokens)

  const chainRecords = records.filter(record => {
    if (record.blockchain !== chainKey) return false
    if (record.category === 'Protocol-Owned Liquidity') return false
    const isOwn = ownTokenSet.has(normalize(record.tokenAddress))
    return mode === 'ownTokens' ? isOwn : !isOwn
  })

  if (chainRecords.length === 0) return {}

  const tokens = [...new Set(chainRecords.map(record => record.tokenAddress))]
  const decimals = await api.multiCall({ abi: 'erc20:decimals', calls: tokens, permitFailure: true })
  const decimalMap = Object.fromEntries(tokens.map((token, i) => [normalize(token), Number(decimals[i])]))

  for (const record of chainRecords) {
    const decimals = decimalMap[normalize(record.tokenAddress)]
    if (decimals == null) continue
    api.add(record.tokenAddress, new BigNumber(record.balance).shiftedBy(decimals).toFixed(0))
  }

  return api.getBalances()
}

async function getOwners(api, chainConfig, mode) {
  const owners = [...(chainConfig.owners || [])]
  if (mode === 'ownTokens') owners.push(...(chainConfig.ownTokenOwners || []))
  const special = chainConfig.special || {}

  if (api.chain === 'ethereum' && special.bophadesKernel) {
    const currentTrsry = await safeCall(api, {
      target: special.bophadesKernel,
      abi: 'function getModuleForKeycode(bytes5 keycode_) view returns (address)',
      params: [special.keycodes.TRSRY],
    })
    if (isAddress(currentTrsry)) owners.push(currentTrsry)

    const chreg = await safeCall(api, {
      target: special.bophadesKernel,
      abi: 'function getModuleForKeycode(bytes5 keycode_) view returns (address)',
      params: [special.keycodes.CHREG],
    })
    if (isAddress(chreg)) {
      const chregOwners = await getChregOwners(api, chreg)
      owners.push(...chregOwners)
    }
  }

  return getUniqueAddresses(owners)
}

async function getChregOwners(api, chreg) {
  const count = await safeCall(api, {
    target: chreg,
    abi: 'uint256:registryCount',
  })
  if (!count) return []

  const calls = Array.from({ length: Number(count) }, (_, i) => i)
  const addresses = await safeMultiCall(api, {
    target: chreg,
    calls,
    abi: 'function registry(uint256) view returns (address)',
  })

  return addresses.filter(isAddress)
}

async function addLiabilities(api, owners, chainConfig) {
  const liabilityTokens = chainConfig.liabilityTokens || []
  if (!liabilityTokens.length || !owners.length) return

  const balances = await safeMultiCall(api, {
    calls: liabilityTokens.flatMap(token => owners.map(owner => ({ target: token, params: [owner] }))),
    abi: 'erc20:balanceOf',
  })

  let i = 0
  for (const token of liabilityTokens) {
    for (const _owner of owners) {
      const balance = balances[i++]
      if (balance) api.add(token, new BigNumber(balance).times(-1).toFixed(0))
    }
  }
}

async function addSpecialPositions(api, owners, chainConfig) {
  const special = chainConfig.special
  if (!special || !owners.length) return

  await addMakerDsr(api, owners, special)
  await addErc4626Shares(api, owners, special)
  await addRemappedTokenBalances(api, owners, special)
  await addVeFxs(api, special)
  await addConvexRewardPools(api, special)
  await addFraxLocks(api, owners, special)
}

async function addMakerDsr(api, owners, special) {
  if (!special.makerDsr) return

  const [pies, chi] = await Promise.all([
    safeMultiCall(api, {
      target: special.makerDsr,
      calls: owners,
      abi: 'function pie(address) view returns (uint256)',
    }),
    safeCall(api, {
      target: special.makerDsr,
      abi: 'uint256:chi',
    }),
  ])

  if (!chi) return
  const dai = pies.reduce((sum, pie) => sum.plus(new BigNumber(pie || 0).times(chi).div(1e27)), new BigNumber(0))
  if (dai.gt(0)) api.add(ADDRESSES.ethereum.DAI, dai.toFixed(0))
}

async function addErc4626Shares(api, owners, special) {
  const vaults = special.erc4626Tokens || []
  if (!vaults.length) return

  for (const vault of vaults) {
    const asset = await safeCall(api, { target: vault, abi: 'address:asset' })
    if (!isAddress(asset)) continue

    const shareBalances = await safeMultiCall(api, {
      target: vault,
      calls: owners,
      abi: 'erc20:balanceOf',
    })

    const assetBalances = await safeMultiCall(api, {
      target: vault,
      calls: shareBalances.map(balance => balance || '0'),
      abi: 'function convertToAssets(uint256 shares) view returns (uint256)',
    })

    assetBalances.forEach(balance => {
      if (balance) api.add(asset, balance)
    })
  }
}

async function addRemappedTokenBalances(api, owners, special) {
  const remaps = special.remapTokens || []
  if (!remaps.length) return

  for (const [source, target] of remaps) {
    const balances = await safeMultiCall(api, {
      target: source,
      calls: owners,
      abi: 'erc20:balanceOf',
    })
    balances.forEach(balance => {
      if (balance) api.add(target, balance)
    })
  }
}

async function addVeFxs(api, special) {
  const { veFxs } = special
  if (!veFxs) return

  const locks = await safeMultiCall(api, {
    target: veFxs.token,
    calls: veFxs.owners,
    abi: 'function locked(address) view returns (int128 amount, uint256 end)',
  })

  locks.forEach(lock => {
    const amount = lock?.amount ?? lock?.[0]
    if (amount && new BigNumber(amount).gt(0)) api.add(veFxs.underlying, amount.toString())
  })
}

async function addConvexRewardPools(api, special) {
  const convexRewardPools = special.convexRewardPools || []
  const owners = special.convexOwners || []
  if (!convexRewardPools.length || !owners.length) return

  await sumTokens2({
    api,
    owners,
    convexRewardPools,
    permitFailure: true,
  })
}

async function addFraxLocks(api, owners, special) {
  const locks = special.fraxLocks || []
  if (!locks.length) return

  for (const lock of locks) {
    const balances = await safeMultiCall(api, {
      target: lock.target,
      calls: owners,
      abi: 'function lockedLiquidityOf(address account) view returns (uint256)',
    })
    balances.forEach(balance => {
      if (balance) api.add(lock.token, balance)
    })
  }
}

function getBlacklist(mode, chainConfig) {
  const polTokens = chainConfig.polTokens || []
  if (mode === 'ownTokens') return polTokens
  return [...(chainConfig.ownTokens || []), ...polTokens]
}

function hasUsableBalances(balances) {
  return Object.values(balances).some(balance => new BigNumber(balance || 0).abs().gt(0))
}

function getUniqueAddresses(addresses) {
  return [...new Set(addresses.filter(isAddress).map(address => address.toLowerCase()))]
}

function getAddressSet(addresses = []) {
  return new Set(addresses.filter(Boolean).map(normalize))
}

function normalize(address) {
  return address?.toLowerCase()
}

function isAddress(address) {
  if (!address) return false
  const normalized = normalize(address)
  return normalized !== ZERO_ADDRESS && /^0x[a-f0-9]{40}$/.test(normalized)
}

async function safeCall(api, params) {
  try {
    return await api.call(params)
  } catch (e) {
    return undefined
  }
}

async function safeMultiCall(api, params) {
  try {
    return await api.multiCall({ ...params, permitFailure: true })
  } catch (e) {
    return []
  }
}

module.exports = {
    ohmTvl,
    buildOlympusTvl,
}

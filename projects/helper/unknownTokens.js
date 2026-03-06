
const sdk = require('@defillama/sdk');
const masterchefAbi = require('./abis/masterchef.json')
const { getChainTransform, getFixBalances, transformBalances, } = require('./portedTokens')
const { getCoreAssets } = require('./tokenMapping')
const { sumTokens, sumTokens2, nullAddress, } = require('./unwrapLPs')
const { vestingHelper } = require('./cache/vestingHelper')
const { getTokenPrices, sumUnknownTokens, getLPData, } = require('./cache/sumUnknownTokens')
const { getUniTVL } = require('./cache/uniswap')
const { getUniqueAddresses, } = require('./utils')


function uniTvlExports(config, commonOptions = {}) {
  function staking(stakingContract, stakingToken) {
    if (!Array.isArray(stakingContract)) stakingContract = [stakingContract]
    if (!Array.isArray(stakingToken)) stakingToken = [stakingToken]
    return (api) => api.sumTokens({ owners: stakingContract, tokens: stakingToken, })
  }

  const exportsObj = {
    misrepresentedTokens: !commonOptions.useDefaultCoreAssets,
  }
  Object.keys(config).forEach(chain => {
    exportsObj[chain] = uniTvlExport(chain, config[chain], commonOptions)[chain]
  })
  if (commonOptions.hallmarks) exportsObj.hallmarks = commonOptions.hallmarks
  if (commonOptions.deadFrom) exportsObj.deadFrom = commonOptions.deadFrom
  if (typeof commonOptions.staking === 'object') {
    Object.entries(commonOptions.staking).forEach(([chain, stakingArgs]) => {
      if (!exportsObj[chain]) exportsObj[chain] = {}
      exportsObj[chain].staking = staking(...stakingArgs)
    })
  }
  return exportsObj
}

function unknownTombs({ token = [], shares = [], rewardPool = [], masonry = [], lps, chain = "ethereum", coreAssets = [],
  useDefaultCoreAssets = false, }) {
  let getPrices
  if (!coreAssets.length && useDefaultCoreAssets)
    coreAssets = getCoreAssets(chain)

  if (!Array.isArray(shares) && typeof shares === 'string')
    shares = [shares]
  if (!Array.isArray(masonry) && typeof masonry === 'string')
    masonry = [masonry]
  if (!Array.isArray(rewardPool) && typeof rewardPool === 'string')
    rewardPool = [rewardPool]
  if (!Array.isArray(token) && typeof token === 'string')
    token = [token]

  const pool2 = async (timestamp, _block, chainBlocks) => {
    let balances = {};
    const block = chainBlocks[chain]
    if (!getPrices)
      getPrices = getTokenPrices({ block, chain, lps, coreAssets, allLps: true })

    const { updateBalances } = await getPrices

    const tao = []
    lps.forEach(token => rewardPool.forEach(owner => tao.push([token, owner])))

    await sumTokens(balances, tao, block, chain, undefined, { resolveLP: true, skipFixBalances: true })
    const fixBalances = getFixBalances(chain)
    await updateBalances(balances)
    fixBalances(balances)
    return balances
  }

  const staking = async (timestamp, _block, chainBlocks) => {
    let balances = {};
    const block = chainBlocks[chain]
    if (!getPrices)
      getPrices = getTokenPrices({ block, chain, lps, coreAssets, allLps: true })

    const { updateBalances } = await getPrices

    const tao = []
    shares.forEach(token => masonry.forEach(owner => tao.push([token, owner])))
    // token.forEach(t => masonry.forEach(owner => tao.push([t, owner])))

    await sumTokens(balances, tao, block, chain, undefined, { skipFixBalances: true })
    const fixBalances = getFixBalances(chain)
    await updateBalances(balances)
    fixBalances(balances)
    return balances
  }

  return {
    misrepresentedTokens: true,
    [chain]: {
      tvl: async () => ({}),
      staking,
      pool2
    }
  }
}

function pool2({ stakingContract, lpToken, chain, transformAddress, coreAssets = [], useDefaultCoreAssets = false, }) {
  if (!coreAssets.length && useDefaultCoreAssets)
    coreAssets = getCoreAssets(chain)

  return async (api) => {
    const chain = api.chain
    const block = api.block
    if (!transformAddress)
      transformAddress = getChainTransform(chain)

    const balances = await sumTokens({}, [[lpToken, stakingContract]], block, chain, transformAddress, { resolveLP: true })
    const { updateBalances } = await getTokenPrices({ block, chain, transformAddress, coreAssets, lps: [lpToken], allLps: true, })

    await updateBalances(balances, { resolveLP: false, })
    const fixBalances = getFixBalances(chain)
    fixBalances(balances)
    return balances
  }
}

function sumTokensExport({ tokensAndOwners = [],
  coreAssets = [], owner, tokens, restrictTokenRatio, blacklist = [], skipConversion = false, onlyLPs, minLPRatio,
  log_coreAssetPrices = [], log_minTokenValue = 1e6, owners = [], lps = [], useDefaultCoreAssets = false, abis,
}) {
  return (api) => sumUnknownTokens({ api, tokensAndOwners, onlyLPs, minLPRatio, coreAssets, owner, tokens, restrictTokenRatio, blacklist, skipConversion, log_coreAssetPrices, log_minTokenValue, owners, lps, useDefaultCoreAssets, abis, })
}

function staking({ tokensAndOwners = [],
  coreAssets = [], owner, tokens, restrictTokenRatio, blacklist = [], skipConversion = false, onlyLPs, minLPRatio,
  log_coreAssetPrices = [], log_minTokenValue = 1e6, owners = [], lps = [], useDefaultCoreAssets = false,
}) {

  return async (api) => {
    const { chain, block } = api
    if (!coreAssets.length && useDefaultCoreAssets)
      coreAssets = getCoreAssets(chain)

    const balances = await sumTokens2({ api, owner, tokensAndOwners, owners, tokens, blacklistedTokens: blacklist, })
    const { updateBalances, pairBalances, prices, } = await getTokenPrices({ coreAssets, lps: [...tokensAndOwners.map(t => t[0]), ...lps,], chain, block, restrictTokenRatio, blacklist, log_coreAssetPrices, log_minTokenValue, minLPRatio })
    // sdk.log(prices, pairBalances, balances)
    await updateBalances(balances, { skipConversion, onlyLPs })
    const fixBalances = getFixBalances(chain)
    fixBalances(balances)
    return balances
  }
}

function masterchefExports({ chain, masterchef, coreAssets = [], nativeTokens = [], lps = [], nativeToken, poolInfoABI = masterchefAbi.poolInfo, poolLengthAbi = masterchefAbi.poolLength, getToken = output => output.lpToken, blacklistedTokens = [], useDefaultCoreAssets = true, }) {
  if (!coreAssets.length && useDefaultCoreAssets)
    coreAssets = getCoreAssets(chain)
  let allTvl = {}
  if (nativeToken) nativeTokens.push(nativeToken)
  nativeTokens = getUniqueAddresses(nativeTokens)

  async function getAllTVL(block) {
    if (!allTvl[block]) allTvl[block] = getTVL()
    return allTvl[block]

    async function getTVL() {
      const transform = getChainTransform(chain)
      const fixBalances = getFixBalances(chain)
      const balances = {
        tvl: {},
        staking: {},
        pool2: {},
      }
      const { output: length } = await sdk.api.abi.call({
        target: masterchef,
        abi: poolLengthAbi,
        chain, block,
      })

      const calls = []
      for (let i = 0; i < length; i++) calls.push({ params: [i] })
      const { output: data } = await sdk.api.abi.multiCall({
        target: masterchef,
        abi: poolInfoABI,
        calls,
        chain, block,
      })

      const tokens = data.map(({ output }) => getToken(output).toLowerCase())
      const tokenLPs = [...tokens].filter(i => !nativeTokens.includes(i))
      const tempBalances = await sumTokens2({ chain, block, owner: masterchef, tokens, transformAddress: a => a, blacklistedTokens, skipFixBalances: true, })
      nativeTokens.forEach(nativeToken => {
        if (tempBalances[nativeToken]) sdk.util.sumSingleBalance(balances.staking, transform(nativeToken), tempBalances[nativeToken])
        delete tempBalances[nativeToken]
      })

      const { updateBalances, pairs, } = await getTokenPrices({ lps: [...tokenLPs, ...lps], coreAssets, block, chain, minLPRatio: 0.001, })
      Object.entries(tempBalances).forEach(([token, balance]) => {
        if (pairs[token]) {
          const { token0Address, token1Address } = pairs[token]
          if (nativeTokens.includes(token0Address) || nativeTokens.includes(token1Address)) {
            sdk.util.sumSingleBalance(balances.pool2, transform(token), balance)
            return;
          }
        }
        sdk.util.sumSingleBalance(balances.tvl, transform(token), balance)
      })

      for (const bal of Object.values(balances)) {
        await updateBalances(bal)
        fixBalances(bal)
      }

      return balances
    }
  }

  async function tvl(_, _b, { [chain]: block }) {
    return (await getAllTVL(block)).tvl
  }

  async function pool2(_, _b, { [chain]: block }) {
    return (await getAllTVL(block)).pool2
  }

  async function staking(_, _b, { [chain]: block }) {
    return (await getAllTVL(block)).staking
  }

  return {
    misrepresentedTokens: true,
    [chain]: {
      tvl, pool2, staking
    }
  }
}

const yieldApis = {
  balance: "uint256:balance",
  token: "address:token",
}

async function yieldHelper({ chain = 'ethereum', block, coreAssets = [], blacklist = [], whitelist = [], vaults = [], transformAddress,
  useDefaultCoreAssets = false, balanceAPI = yieldApis.balance, tokenAPI = yieldApis.token, api,
  restrictTokenRatio, // while computing tvl, an unknown token value can max be x times the pool value, default 100 times pool value
}) {
  if (api) {
    chain = api.chain
    block = api.block
  }
  if (!coreAssets.length && useDefaultCoreAssets)
    coreAssets = getCoreAssets(chain)

  if (!transformAddress)
    transformAddress = getChainTransform(chain)

  const calls = vaults.map(i => ({ target: i }))
  const { output: balanceRes } = await sdk.api.abi.multiCall({
    abi: balanceAPI,
    calls,
    chain, block,
  })
  const { output: targets } = await sdk.api.abi.multiCall({
    abi: tokenAPI,
    calls,
    chain, block,
  })
  const tokens = targets.map(i => i.output)
  const { updateBalances } = await getTokenPrices({ chain, block, lps: tokens, coreAssets, blacklist, whitelist, transformAddress, restrictTokenRatio, useDefaultCoreAssets, })
  let balances = {}
  balanceRes.forEach((data, i) => sdk.util.sumSingleBalance(balances, transformAddress(tokens[i]), data.output))
  await updateBalances(balances)
  return transformBalances(chain, balances)
}

function uniTvlExport(chain, factory, options = {}) {
  const exportsObj = {
    misrepresentedTokens: !options.useDefaultCoreAssets,
    [chain]: { tvl: getUniTVL({ chain, factory, useDefaultCoreAssets: true, ...options }) }
  }
  return exportsObj
}

// Default ABI for CLM vaults that expose wants() => (token0, token1) and balances() => (amount0, amount1)
const pairApis = {
  balances: 'function balances() view returns (uint256 amount0, uint256 amount1)',
  wants: 'function wants() view returns (address token0, address token1)',
}

// Helper for CLM-style vaults (wants() + balances()) returning two tokens and two balances
async function yieldHelperPair({
  chain = 'ethereum', block, coreAssets = [], blacklist = [], whitelist = [], vaults = [], transformAddress,
  useDefaultCoreAssets = false,
  balanceAPI = pairApis.balances,
  tokenAPI = pairApis.wants,
  restrictTokenRatio,
}) {

  if (!balanceAPI || !tokenAPI)
    throw new Error('yieldHelperPair requires both balanceAPI and tokenAPI')

  if (!coreAssets.length && useDefaultCoreAssets)
    coreAssets.push(...getCoreAssets(chain))

  if (!transformAddress)
    transformAddress = getChainTransform(chain)

  const calls = vaults.map(i => ({ target: i }))

  const { output: balanceRes } = await sdk.api.abi.multiCall({ abi: balanceAPI, calls, chain, block })
  const { output: tokenRes } = await sdk.api.abi.multiCall({ abi: tokenAPI, calls, chain, block })

  const allTokens = []
  const allBalances = []

  balanceRes.forEach((balObj, i) => {
    const tokensObj = tokenRes[i]?.output || {}

    const token0 = tokensObj.token0 ?? tokensObj[0]
    const token1 = tokensObj.token1 ?? tokensObj[1]

    const amount0 = balObj.output?.amount0 ?? balObj.output?.[0] ?? 0
    const amount1 = balObj.output?.amount1 ?? balObj.output?.[1] ?? 0

    if (token0) {
      allTokens.push(token0)
      allBalances.push(amount0)
    }
    if (token1) {
      allTokens.push(token1)
      allBalances.push(amount1)
    }
  })

  const { updateBalances } = await getTokenPrices({ chain, block, lps: allTokens, coreAssets, blacklist, whitelist, transformAddress, restrictTokenRatio, useDefaultCoreAssets, })

  const balances = {}
  allTokens.forEach((t, idx) => sdk.util.sumSingleBalance(balances, transformAddress(t), allBalances[idx]))

  await updateBalances(balances)
  return transformBalances(chain, balances)
}

// --------------------------------------------------------------------------

module.exports = {
  nullAddress,
  getTokenPrices,
  getUniTVL,
  unknownTombs,
  pool2,
  getLPData,
  masterchefExports,
  vestingHelper,
  sumUnknownTokens,
  staking,
  sumTokensExport,
  yieldHelper,
  uniTvlExport,
  uniTvlExports,
  yieldHelperPair,
};
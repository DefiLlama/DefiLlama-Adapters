
const sdk = require('@defillama/sdk');
const masterchefAbi = require('./abis/masterchef.json')
const { getChainTransform, getFixBalances, transformBalances, } = require('./portedTokens')
const { getCoreAssets } = require('./tokenMapping')
const { sumTokens, sumTokens2, nullAddress, } = require('./unwrapLPs')
const { vestingHelper } = require('./cache/vestingHelper')
const { getTokenPrices, sumUnknownTokens, getLPData, } = require('./cache/sumUnknownTokens')
const { getUniTVL } = require('./cache/uniswap')
const { getUniqueAddresses, } = require('./utils')

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
    const fixBalances = await getFixBalances(chain)
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
    const fixBalances = await getFixBalances(chain)
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

  return async (_timestamp, _ethBlock, chainBlocks, { api }) => {
    if (!chain) chain = api.chain
    const block = chainBlocks[chain]
    if (!transformAddress)
      transformAddress = await getChainTransform(chain)

    const balances = await sumTokens({}, [[lpToken, stakingContract]], block, chain, transformAddress, { resolveLP: true })
    const { updateBalances } = await getTokenPrices({ block, chain, transformAddress, coreAssets, lps: [lpToken], allLps: true, })

    await updateBalances(balances, { resolveLP: false, })
    const fixBalances = await getFixBalances(chain)
    fixBalances(balances)
    return balances
  }
}

function sumTokensExport({ tokensAndOwners = [],
  coreAssets = [], owner, tokens, restrictTokenRatio, blacklist = [], skipConversion = false, onlyLPs, minLPRatio,
  log_coreAssetPrices = [], log_minTokenValue = 1e6, owners = [], lps = [], useDefaultCoreAssets = false, abis,
}) {
  return (_, _b, _cb, { api }) => sumUnknownTokens({ api, tokensAndOwners, onlyLPs, minLPRatio, coreAssets, owner, tokens, restrictTokenRatio, blacklist, skipConversion, log_coreAssetPrices, log_minTokenValue, owners, lps, useDefaultCoreAssets, abis, })
}

function staking({ tokensAndOwners = [],
  coreAssets = [], owner, tokens, restrictTokenRatio, blacklist = [], skipConversion = false, onlyLPs, minLPRatio,
  log_coreAssetPrices = [], log_minTokenValue = 1e6, owners = [], lps = [], useDefaultCoreAssets = false,
}) {

  return async (_, _b, _cb, { api, chain = 'ethereum', block, }) => {
    if (!coreAssets.length && useDefaultCoreAssets)
      coreAssets = getCoreAssets(chain)

    const balances = await sumTokens2({ api, owner, tokensAndOwners, owners, tokens, blacklistedTokens: blacklist, })
    const { updateBalances, pairBalances, prices, } = await getTokenPrices({ coreAssets, lps: [...tokensAndOwners.map(t => t[0]), ...lps,], chain, block, restrictTokenRatio, blacklist, log_coreAssetPrices, log_minTokenValue, minLPRatio })
    // sdk.log(prices, pairBalances, balances)
    await updateBalances(balances, { skipConversion, onlyLPs })
    const fixBalances = await getFixBalances(chain)
    fixBalances(balances)
    return balances
  }
}

function masterchefExports({ chain, masterchef, coreAssets = [], nativeTokens = [], lps = [], nativeToken, poolInfoABI = masterchefAbi.poolInfo, poolLengthAbi = masterchefAbi.poolLength, getToken = output => output.lpToken, blacklistedTokens = [], useDefaultCoreAssets = false, }) {
  if (!coreAssets.length && useDefaultCoreAssets)
    coreAssets = getCoreAssets(chain)
  let allTvl = {}
  if (nativeToken) nativeTokens.push(nativeToken)
  nativeTokens = getUniqueAddresses(nativeTokens)

  async function getAllTVL(block) {
    if (!allTvl[block]) allTvl[block] = getTVL()
    return allTvl[block]

    async function getTVL() {
      const transform = await getChainTransform(chain)
      const fixBalances = await getFixBalances(chain)
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
  useDefaultCoreAssets = false, balanceAPI = yieldApis.balance, tokenAPI = yieldApis.token,
  restrictTokenRatio, // while computing tvl, an unknown token value can max be x times the pool value, default 100 times pool value
}) {
  if (!coreAssets.length && useDefaultCoreAssets)
    coreAssets = getCoreAssets(chain)

  if (!transformAddress)
    transformAddress = await getChainTransform(chain)

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
  return {
    misrepresentedTokens: true,
    [chain]: { tvl: getUniTVL({ chain, factory, useDefaultCoreAssets: true, ...options }) }
  }
}

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
};
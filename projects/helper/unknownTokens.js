
const sdk = require('@defillama/sdk');
const masterchefAbi = require('./abis/masterchef.json')
const { getChainTransform, getFixBalances, transformBalances, transformDexBalances, } = require('./portedTokens')
const { getCoreAssets } = require('./tokenMapping')
const { sumTokens, sumTokens2, nullAddress, } = require('./unwrapLPs')
const { vestingHelper } = require('./cache/vestingHelper')
const { getTokenPrices, sumUnknownTokens, getLPData, } = require('./cache/sumUnknownTokens')
const { getUniqueAddresses, sliceIntoChunks, log } = require('./utils')
const factoryAbi = require('./abis/factory.json');


function getUniTVL({ chain = 'ethereum', coreAssets = [], blacklist = [], whitelist = [], factory, transformAddress,
  minLPRatio = 1,
  log_coreAssetPrices = [], log_minTokenValue = 1e6,
  withMetaData = false,
  skipPair = [],
  useDefaultCoreAssets = false,
  abis = {},
  restrictTokenRatio, // while computing tvl, an unknown token value can max be x times the pool value, default 100 times pool value
  fetchInChunks = 0,  // if there are too many pairs, we might want to query in batches to avoid multicall failing and crashing
  version = '1',
}) {
  if (!coreAssets.length && useDefaultCoreAssets) {
    coreAssets = getCoreAssets(chain)
  }
  const isVersion2 = version === '2'
  if (fetchInChunks && isVersion2) {
    throw new Error('Not yet supported!')
  }

  return async (ts, _block, { [chain]: block }) => {

    // get factory from LP
    // console.log(await sdk.api.abi.call({ target: '0x463e451d05f84da345d641fbaa3129693ce13816', abi: { "inputs": [], "name": "factory", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, chain, block, }))
    let pairAddresses;
    const pairLength = (await sdk.api.abi.call({ target: factory, abi: abis.allPairsLength || factoryAbi.allPairsLength, chain, block })).output
    if (pairLength === null)
      throw new Error("allPairsLength() failed")

    log(chain, ' No. of pairs: ', pairLength)

    let pairNums = Array.from(Array(Number(pairLength)).keys())
    if (skipPair.length) pairNums = pairNums.filter(i => !skipPair.includes(i))

    if (fetchInChunks === 0) {
      let pairs = (await sdk.api.abi.multiCall({ abi: abis.allPairs || factoryAbi.allPairs, chain, calls: pairNums.map(num => ({ target: factory, params: [num] })), block })).output

      pairAddresses = pairs.map(result => result.output.toLowerCase())
      const response = await getTokenPrices({
        block, chain, coreAssets, blacklist, lps: pairAddresses, transformAddress, whitelist, allLps: true,
        minLPRatio, log_coreAssetPrices, log_minTokenValue, restrictTokenRatio, abis,
      })
      if (isVersion2) return transformDexBalances({ chain, data: response.pairBalances2, })
      return withMetaData ? response : response.balances
    } else {
      let i = 0
      const allBalances = {}
      const chunks = sliceIntoChunks(pairNums, fetchInChunks)
      for (const chunk of chunks) {
        log(`fetching ${++i} of ${chunks.length}`)
        let pairs = (await sdk.api.abi.multiCall({ abi: factoryAbi.allPairs, chain, calls: chunk.map(num => ({ target: factory, params: [num] })), block })).output
        pairAddresses = pairs.map(result => result.output.toLowerCase())
        const { balances } = await getTokenPrices({
          block, chain, coreAssets, blacklist, lps: pairAddresses, transformAddress, whitelist, allLps: true,
          minLPRatio, log_coreAssetPrices, log_minTokenValue, restrictTokenRatio, abis,
        })
        Object.entries(balances).forEach(([token, value]) => sdk.util.sumSingleBalance(allBalances, token, value))
      }
      return allBalances
    }
  }
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

function pool2({ stakingContract, lpToken, chain = "ethereum", transformAddress, coreAssets = [], useDefaultCoreAssets = false, }) {
  if (!coreAssets.length && useDefaultCoreAssets)
    coreAssets = getCoreAssets(chain)

  return async (_timestamp, _ethBlock, chainBlocks) => {
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
  coreAssets = [], owner, tokens, chain = 'ethereum', restrictTokenRatio, blacklist = [], skipConversion = false, onlyLPs, minLPRatio,
  log_coreAssetPrices = [], log_minTokenValue = 1e6, owners = [], lps = [], useDefaultCoreAssets = false,
}) {
  return (_, _b, { [chain]: block }) => sumUnknownTokens({ tokensAndOwners, coreAssets, owner, tokens, chain, block, restrictTokenRatio, blacklist, skipConversion, log_coreAssetPrices, log_minTokenValue, owners, lps, useDefaultCoreAssets, })
}

function staking({ tokensAndOwners = [],
  coreAssets = [], owner, tokens, chain = 'ethereum', restrictTokenRatio, blacklist = [], skipConversion = false, onlyLPs, minLPRatio,
  log_coreAssetPrices = [], log_minTokenValue = 1e6, owners = [], lps = [], useDefaultCoreAssets = false,
}) {
  if (!coreAssets.length && useDefaultCoreAssets)
    coreAssets = getCoreAssets(chain)
  blacklist = getUniqueAddresses(blacklist)
  if (!tokensAndOwners.length)
    if (owners.length)
      tokensAndOwners = owners.map(o => tokens.map(t => [t, o])).flat()
    else if (owner)
      tokensAndOwners = tokens.map(t => [t, owner])
  tokensAndOwners = tokensAndOwners.filter(t => !blacklist.includes(t[0]))

  return async (_, _b, { [chain]: block }) => {
    const balances = await sumTokens2({ chain, block, tokensAndOwners })
    const { updateBalances, pairBalances, prices, } = await getTokenPrices({ coreAssets, lps: [...tokensAndOwners.map(t => t[0]), ...lps,], chain, block, restrictTokenRatio, blacklist, log_coreAssetPrices, log_minTokenValue, minLPRatio })
    await updateBalances(balances, { skipConversion, onlyLPs })
    const fixBalances = await getFixBalances(chain)
    fixBalances(balances)
    return balances
  }
}

function masterchefExports({ chain, masterchef, coreAssets = [], nativeTokens = [], lps = [], nativeToken, poolInfoABI = masterchefAbi.poolInfo, poolLengthAbi = masterchefAbi.poolLength, getToken = output => output.lpToken, blacklistedTokens = [], useDefaultCoreAssets = false, }) {
  if (!coreAssets.length && useDefaultCoreAssets)
    coreAssets = getCoreAssets(chain)
  let allTvl
  if (nativeToken) nativeTokens.push(nativeToken)
  nativeTokens = getUniqueAddresses(nativeTokens)

  async function getAllTVL(block) {
    if (!allTvl) allTvl = getTVL()
    return allTvl

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
      const tempBalances = await sumTokens2({ chain, block, owner: masterchef, tokens, transformAddress: a => a, blacklistedTokens })
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
  balance: {
    "inputs": [],
    "name": "balance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  token: {
    "type": "function",
    "stateMutability": "view",
    "outputs": [
      {
        "type": "address",
        "name": "",
        "internalType": "contract IERC20"
      }
    ],
    "name": "token",
    "inputs": []
  }
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

function uniTvlExport(chain, factory) {
  return {
    misrepresentedTokens: true,
    [chain]: { tvl: getUniTVL({ chain, factory, useDefaultCoreAssets: true }) }
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
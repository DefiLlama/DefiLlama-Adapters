const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js')

const symbol = 'string:symbol'
const token0 = 'address:token0'
const token1 = 'address:token1'
const kslpABI = require('../abis/kslp.js');
const getReserves = 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)'

const { getChainTransform, stripTokenHeader, getFixBalances, } = require('../portedTokens')
const { getCoreAssets } = require('../tokenMapping')
const { sumTokens2, nullAddress, } = require('../unwrapLPs')
const { isLP, getUniqueAddresses, log } = require('../utils')

async function getLPData({
  block,
  chain = 'ethereum',
  lps = [], // list of token addresses (all need not be LPs, code checks and filters out non LPs)
  allLps = false,   // if set true, assumes all tokens provided as lps are lps and skips validation/filtering
  abis = {},
  lpFilter = isLP,
}) {
  lps = getUniqueAddresses(lps)
  const pairAddresses = allLps ? lps : await getLPList({ lps, chain, block, lpFilter, })
  const pairCalls = pairAddresses.map((pairAddress) => ({ target: pairAddress, }))
  let token0Addresses, token1Addresses

  [token0Addresses, token1Addresses] = await Promise.all([
    sdk.api.abi.multiCall({ abi: abis.token0ABI || token0, chain, calls: pairCalls, block, }).then(({ output }) => output),
    sdk.api.abi.multiCall({ abi: abis.token1ABI || token1, chain, calls: pairCalls, block, }).then(({ output }) => output),
  ]);
  const pairs = {};
  // add token0Addresses
  token0Addresses.forEach((token0Address) =>
    pairs[token0Address.input.target] = {
      token0Address: token0Address.output.toLowerCase(),
    }
  )
  token1Addresses.forEach((token1Address) => {
    if (!pairs[token1Address.input.target]) pairs[token1Address.input.target] = {}
    pairs[token1Address.input.target].token1Address = token1Address.output.toLowerCase()
  })
  return pairs
}

async function getLPList({ lps, chain, block, lpFilter = isLP, cache = {}, }) {
  lps = lps.filter(i => i !== nullAddress)
  if (!cache.symbol) cache.symbol = {}
  lps = lps.filter(i => i)
  const callArgs = lps.filter(i => !cache.symbol[i]).map(t => ({ target: t }));
  (await sdk.api.abi.multiCall({ calls: callArgs, abi: symbol, block, chain, permitFailure: true, })).output
    .forEach(i => cache.symbol[i.input.target] = i.output)
  return lps.filter(i => lpFilter(cache.symbol[i], i, chain))
}

async function getTokenPrices({
  api,
  block,
  chain = 'ethereum',
  abis = {},  // if some protocol uses custom abi instead of standard one
  useDefaultCoreAssets = false,  // use pre-defined list
  coreAssets = [],  // list of tokens that can used as base token to price unknown tokens against (Note: order matters, is there are two LPs for a token, the core asset with a lower index is used)
  blacklist = [],   // list of tokens to ignore/blacklist
  whitelist = [],   // if set, tvl/price is computed only for these tokens
  lps = [], // list of token addresses (all need not be LPs, code checks and filters out non LPs)
  transformAddress, // function for transforming token address to coingecko friendly format
  allLps = false,   // if set true, assumes all tokens provided as lps are lps and skips validation/filtering
  minLPRatio = 0.5, // if a token pool has less that this percent of core asset tokens compared to a token pool with max tokens for a given core asset, this token pool is not used for price calculation
  restrictTokenRatio = 10, // while computing tvl, an unknown token value can max be x times the pool value, default 100 times pool value
  log_coreAssetPrices = [],
  log_minTokenValue = 1e6, // log only if token value is higer than this value, now minimum is set as 1 million
  lpFilter,   // override the default logic for checking if an address is LP based on it's symbol
  token0CallFn,
  token1CallFn,
  reservesCallFn,
  cache = {},
}) {
  if (!api)
    api = new sdk.ChainApi({ block, chain, })
  else {
    chain = api.chain
    block = api.block
  }
  if (!cache.pairData) cache.pairData = {}
  let counter = 0
  if (!transformAddress)
    transformAddress = getChainTransform(chain)

  if (!coreAssets.length && useDefaultCoreAssets)
    coreAssets = getCoreAssets(chain)

  coreAssets = coreAssets.map(i => i.toLowerCase())
  blacklist = blacklist.map(i => i.toLowerCase())
  whitelist = whitelist.map(i => i.toLowerCase())
  lps = getUniqueAddresses(lps)
  const pairAddresses = (allLps && !lpFilter) ? lps : await getLPList({ lps, chain, block, lpFilter, cache })
  const toCall = (pairAddress) => ({ target: pairAddress, })
  const pairCalls = pairAddresses.map(toCall)
  const pairs = cache.pairData;
  const token0Calls = pairAddresses.filter(i => !pairs[i] || !pairs[i].token0Address).map(toCall)
  const token1Calls = pairAddresses.filter(i => !pairs[i] || !pairs[i].token1Address).map(toCall)


  let token0Addresses, token1Addresses, reserves

  if (token0CallFn) {
    token0Addresses = token0CallFn({ chain, block, calls: token0Calls, api, })
  } else {
    token0Addresses = api.multiCall({ abi: abis.token0ABI || token0, chain, calls: token0Calls, block, withMetadata: true, })
  }

  if (token1CallFn) {
    token1Addresses = token1CallFn({ chain, block, calls: token1Calls, api })
  } else {
    token1Addresses = api.multiCall({ abi: abis.token1ABI || token1, chain, calls: token1Calls, block, withMetadata: true, })
  }

  if (reservesCallFn) {
    reserves = reservesCallFn({ chain, block, calls: pairCalls, api, })
  } else {
    reserves = api.multiCall({ abi: abis.getReservesABI || getReserves, chain, calls: pairCalls, block, withMetadata: true, })
  }

  [token0Addresses, token1Addresses, reserves] = await Promise.all([token0Addresses, token1Addresses, reserves]);

  // add token0Addresses
  token0Addresses.forEach((token0Address) => {
    const tokenAddress = token0Address.output.toLowerCase();

    const pairAddress = token0Address.input.target.toLowerCase();
    pairs[pairAddress] = {
      ...(pairs[pairAddress] || {}),
      token0Address: tokenAddress,
    }
  });

  // add token1Addresses
  token1Addresses.forEach((token1Address) => {
    const tokenAddress = token1Address.output.toLowerCase();
    const pairAddress = token1Address.input.target.toLowerCase();
    pairs[pairAddress] = {
      ...(pairs[pairAddress] || {}),
      token1Address: tokenAddress,
    }
  });

  const prices = {}
  const pairBalances = {}

  for (let i = 0; i < reserves.length; i++) {
    const pairAddress = reserves[i].input.target.toLowerCase();
    const pair = pairs[pairAddress];
    pairBalances[pairAddress] = {}
    const token0Address = pair.token0Address.toLowerCase()
    const token1Address = pair.token1Address.toLowerCase()
    const reserveAmounts = reserves[i].output
    if (coreAssets.includes(token0Address) && coreAssets.includes(token1Address)) {
      sdk.util.sumSingleBalance(pairBalances[pairAddress], token0Address, Number(reserveAmounts[0]))
      sdk.util.sumSingleBalance(pairBalances[pairAddress], token1Address, Number(reserveAmounts[1]))
    } else if (coreAssets.includes(token0Address)) {
      sdk.util.sumSingleBalance(pairBalances[pairAddress], token0Address, Number(reserveAmounts[0]) * 2)
      if (!blacklist.includes(token1Address) && (!whitelist.length || whitelist.includes(token1Address))) {
        setPrice(prices, token1Address, reserveAmounts[0], reserveAmounts[1], token0Address)
      }
    } else if (coreAssets.includes(token1Address)) {
      if (!reserveAmounts) log('missing reserves', pairAddress)
      sdk.util.sumSingleBalance(pairBalances[pairAddress], token1Address, Number(reserveAmounts[1]) * 2)
      if (!blacklist.includes(token0Address) && (!whitelist.length || whitelist.includes(token0Address))) {
        setPrice(prices, token0Address, reserveAmounts[1], reserveAmounts[0], token1Address)
      }
    } else {
      const isWhitelistedToken0 = !blacklist.includes(token0Address)
      const isWhitelistedToken1 = !blacklist.includes(token1Address)
      if (isWhitelistedToken0 && isWhitelistedToken1) {
        sdk.util.sumSingleBalance(pairBalances[pairAddress], token0Address, Number(reserveAmounts[0]))
        sdk.util.sumSingleBalance(pairBalances[pairAddress], token1Address, Number(reserveAmounts[1]))
      } else if (isWhitelistedToken0) {
        sdk.util.sumSingleBalance(pairBalances[pairAddress], token0Address, Number(reserveAmounts[0]) * 2)
      } else if (isWhitelistedToken1) {
        sdk.util.sumSingleBalance(pairBalances[pairAddress], token1Address, Number(reserveAmounts[1]) * 2)
      }
    }
  }

  // set price of tokens that are not directly paired against core assets but with tokens that are paired against core tokens

  for (let i = 0; i < reserves.length; i++) {
    const pairAddress = reserves[i].input.target.toLowerCase();
    const pair = pairs[pairAddress];
    const token0Address = pair.token0Address.toLowerCase()
    const token1Address = pair.token1Address.toLowerCase()
    const reserveAmounts = reserves[i].output
    if ((coreAssets.includes(token0Address) && coreAssets.includes(token1Address))
      || coreAssets.includes(token0Address)
      || coreAssets.includes(token1Address)
    ) { // ignore these cases as tokens are already taken care of here
    } else {
      const isWhitelistedToken0 = !blacklist.includes(token0Address)
      const isWhitelistedToken1 = !blacklist.includes(token1Address)
      if (isWhitelistedToken0 && prices[token0Address] && !prices[token1Address]) {
        pairBalances[pairAddress] = {}
        const [coreTokenAmountInLP, tokenPrice, coreAsset,] = prices[token0Address]
        const newCoreAmount = coreTokenAmountInLP * tokenPrice / 10 // we are diluting the amount of core tokens intentionally
        const newTokenAmount = reserveAmounts[1] / 10 // also divided by 10 to keep price steady
        // setPrice(prices, token1Address, newCoreAmount, newTokenAmount, coreAsset)
        sdk.util.sumSingleBalance(pairBalances[pairAddress], token0Address, Number(reserveAmounts[0]) * 2)
      } else if (isWhitelistedToken1 && prices[token1Address] && !prices[token0Address]) {
        pairBalances[pairAddress] = {}
        const [coreTokenAmountInLP, tokenPrice, coreAsset,] = prices[token1Address]
        const newCoreAmount = coreTokenAmountInLP * tokenPrice / 10 // we are diluting the amount of core tokens intentionally
        const newTokenAmount = reserveAmounts[0] / 10 // also divided by 10 to keep price steady
        // setPrice(prices, token0Address, newCoreAmount, newTokenAmount, coreAsset)
        sdk.util.sumSingleBalance(pairBalances[pairAddress], token1Address, Number(reserveAmounts[1]) * 2)
      }
    }
  }

  if (!lpFilter && customLPHandlers[chain]) { // we want to handle custom LPs but dont want to end up in recorsive loop, hence this check
    for (const customOptions of Object.values(customLPHandlers[chain])) {
      const options = { ...arguments[0], ...customOptions }
      const { prices: customPrices, pairBalances: customPairBalances, pairs: customPairs } = await getTokenPrices(options)
      // add custom LP data to existing data
      Object.entries(customPairs).forEach(([key, value]) => pairs[key] = value)
      Object.entries(customPrices).forEach(([key, value]) => prices[key] = value)
      Object.entries(customPairBalances).forEach(([key, value]) => pairBalances[key] = value)
    }
  }

  filterPrices(prices)
  const balances = {}
  Object.keys(pairBalances).forEach(key => addBalances(pairBalances[key], balances, { pairAddress: key }))
  const fixBalances = getFixBalances(chain)
  fixBalances(balances)

  return {
    pairs,
    updateBalances,
    pairBalances,
    prices,
    balances,
  }

  function setPrice(prices, address, coreAmount, tokenAmount, coreAsset) {
    if (prices[address] !== undefined) {
      const currentCoreAmount = prices[address][0]
      const currentCoreAsset = prices[address][2]
      // core asset higher on the list has higher preference
      if (coreAssets.indexOf(currentCoreAmount) < coreAssets.indexOf(coreAsset)) return;
      if ((currentCoreAsset === coreAsset) && coreAmount < currentCoreAmount) return;
    }
    if (Number(tokenAmount) > 0)
      prices[address] = [Number(coreAmount), Number(coreAmount) / Number(tokenAmount), coreAsset, +Number(tokenAmount)]
  }

  function getAssetPrice(asset) {
    const assetIndex = coreAssets.indexOf(asset.toLowerCase())
    if (assetIndex === -1 || !log_coreAssetPrices[assetIndex]) return 1 / 1e18
    return log_coreAssetPrices[assetIndex]
  }

  async function updateBalances(balances, { resolveLP = true, skipConversion = false, onlyLPs = false, } = {}) {
    let lpAddresses = []  // if some of the tokens in balances are LP tokens, we resolve those as well
    log('---updating balances-----')
    const finalBalances = onlyLPs ? {} : balances
    counter = 0
    Object.entries(balances).forEach(([address, amount = 0]) => {
      const token = stripTokenHeader(address)
      const price = prices[token];
      if (pairBalances[token]) {
        lpAddresses.push(token)
        return;
      }
      if (!price || skipConversion) return;
      let tokenAmount = price[1] * +amount
      const coreAsset = price[2]
      const tokensInLP = price[3]
      const coreTokenAmountInLP = price[0]
      const maxAllowedAmount = coreTokenAmountInLP * restrictTokenRatio
      // if (tokenAmount * getAssetPrice(coreAsset) > log_minTokenValue)
      //   sdk.log(`[converting balances] token vaule (in millions): ${(tokenAmount * getAssetPrice(coreAsset) / 1e6).toFixed(4)}, token value higher than pool: ${+amount > +tokensInLP} token: ${token} counter: ${++counter}`)

      if (tokenAmount > maxAllowedAmount) {// use token amount in pool if balances amount is higher than amount in pool
        log(`[converting balances]  Value to LP ratio: ${tokenAmount / tokensInLP} token: ${token} counter: ${++counter}`)
        sdk.util.sumSingleBalance(balances, transformAddress(coreAsset), BigNumber(maxAllowedAmount).toFixed(0))
        balances[address] = BigNumber((tokenAmount - maxAllowedAmount) / price[1]).toFixed(0)
      } else {
        sdk.util.sumSingleBalance(balances, transformAddress(coreAsset), BigNumber(tokenAmount).toFixed(0))
        delete balances[address]
      }
    })

    if (!resolveLP) {
      fixBalances(balances)
      return balances
    }

    if (lpAddresses.length) {
      const totalBalances = (await sdk.api.abi.multiCall({
        abi: 'erc20:totalSupply', calls: lpAddresses.map(i => ({ target: i })), block, chain
      })).output

      totalBalances.forEach((item) => {
        const token = item.input.target
        const address = transformAddress(token)
        const ratio = +item.output > 0 ? (+(balances[address]) || 0) / +item.output : 0
        addBalances(pairBalances[token], finalBalances, { ratio, pairAddress: token, skipConversion, })
        delete balances[address]
      })
    }

    fixBalances(finalBalances)
    return finalBalances
  }

  function addBalances(balances, finalBalances, { skipConversion = false, pairAddress, ratio = 1 }) {
    if (ratio > 1) {
      console.log(`There is bug in the code. Pair address: ${pairAddress}, ratio: ${ratio}`)
      ratio = 1
    }
    Object.entries(balances).forEach(([address, amount = 0]) => {
      const price = prices[address];
      // const price =  undefined; // NOTE: this is disabled till, we add a safeguard to limit LP manipulation to inflate token price, like mimimum core asset liquidity to be 10k
      if (price && !skipConversion) {
        const coreTokenAmountInLP = price[0]
        const coreAsset = price[2]
        const tokensInLP = price[3]
        let tokenAmount = price[1] * +amount
        const maxAllowedAmount = coreTokenAmountInLP * restrictTokenRatio
        // if (tokenAmount * getAssetPrice(coreAsset) * ratio > log_minTokenValue)
        //   sdk.log(`[resolve LP balance] token vaule (in millions): ${(tokenAmount * getAssetPrice(coreAsset) * ratio / 1e6).toFixed(4)}, token value higher than pool: ${+amount > +tokensInLP} LP Address: ${pairAddress} token: ${address} ratio: ${ratio} counter: ${++counter}`)

        if (tokenAmount > maxAllowedAmount) {// use token amount in pool if balances amount is higher than amount in pool
          log(`[converting balances]  Value to LP ratio: ${tokenAmount / tokensInLP} LP Address: ${pairAddress} ratio: ${ratio} token: ${address} counter: ${++counter}`)
          sdk.util.sumSingleBalance(balances, transformAddress(coreAsset), BigNumber(maxAllowedAmount * ratio).toFixed(0))
        } else {
          sdk.util.sumSingleBalance(balances, transformAddress(coreAsset), BigNumber(tokenAmount * ratio).toFixed(0))
        }
      } else {
        if ((coreAssets.includes(address)) && (+amount * getAssetPrice(address) * ratio > log_minTokenValue))
          sdk.log(`[resolve LP balance] token vaule (in millions): ${(+amount * getAssetPrice(address) * ratio / 1e6).toFixed(4)}, LP Address: ${pairAddress}  core token: ${address} ratio: ${ratio} counter: ${++counter}`)
        sdk.util.sumSingleBalance(finalBalances, transformAddress(address), BigNumber(+amount * ratio).toFixed(0))
      }
    })
  }

  // If we fetch prices from pools with low liquidity, the value of tokens can be absurdly high, so we set a threshold that if we are using a core asset to determine price,
  // the amount of said core asset in a pool from which price is fetched must be at least 0.5% of the amount of core asset tokens in pool with highest core asset tokens
  function filterPrices(prices) {
    const maxCoreTokens = {}
    Object.values(prices).forEach(([amount, _, coreAsset]) => {
      if (!maxCoreTokens[coreAsset] || maxCoreTokens[coreAsset] < +amount)
        maxCoreTokens[coreAsset] = +amount
    })

    Object.keys(prices).forEach(token => {
      const priceArry = prices[token]
      const [amount, _, coreAsset] = priceArry
      if (!maxCoreTokens[coreAsset]) throw new Error('there is bug in the code')
      const lpRatio = +amount * 100 / maxCoreTokens[coreAsset]
      if (lpRatio < minLPRatio) delete prices[token] // current pool has less than 0.5% of tokens compared to pool with highest number of core tokens
    })
  }
}

async function sumUnknownTokens({ api, tokensAndOwners = [], balances,
  coreAssets = [], owner, tokens, chain = 'ethereum', block, restrictTokenRatio, blacklist = [], skipConversion = false, onlyLPs, minLPRatio,
  log_coreAssetPrices = [], log_minTokenValue = 1e6, owners = [], lps = [], useDefaultCoreAssets = false, cache = {}, resolveLP = false, abis,
  ownerTokens = [], allLps = false,
}) {
  if (api) {
    chain = api.chain ?? chain
    block = api.block ?? block
    if (!balances) balances = api.getBalances()
  } else if (!balances) {
    balances = {}
  }
  if (!coreAssets.length && useDefaultCoreAssets)
    coreAssets = getCoreAssets(chain)
  blacklist = getUniqueAddresses(blacklist)
  if (!tokensAndOwners.length)
    if (owners.length)
      tokensAndOwners = owners.map(o => tokens.map(t => [t, o])).flat()
    else if (owner)
      tokensAndOwners = tokens.map(t => [t, owner])
    else if (ownerTokens.length)
      ownerTokens.forEach(([tokens, owner]) => tokens.forEach(i => tokensAndOwners.push([i, owner])))
  tokensAndOwners = tokensAndOwners.filter(t => !blacklist.includes(t[0]))
  await sumTokens2({ api, balances, chain, block, tokensAndOwners, skipFixBalances: true, resolveLP, abis })
  const { updateBalances, } = await getTokenPrices({ cache, coreAssets, lps: [...tokensAndOwners.map(t => t[0]), ...lps,], chain, block, restrictTokenRatio, blacklist, log_coreAssetPrices, log_minTokenValue, minLPRatio, abis, allLps, })
  await updateBalances(balances, { skipConversion, onlyLPs })
  const fixBalances = getFixBalances(chain)
  fixBalances(balances)
  return balances
}

// sushi constant product LP
const SCPLP = {
  lpFilter: (symbol, addr, chain) => symbol === 'SCPLP',
  abis: {
    getReservesABI: "function getAssets() external view returns (uint _reserve0, uint _reserve1)",
  },
}
const syncswap = {
  lpFilter: (symbol, addr, chain) => ['scroll', 'era'].includes(chain) && /(cSLP|sSLP)$/.test(symbol),
  abis: {
    getReservesABI: "function getReserves() external view returns (uint _reserve0, uint _reserve1)",
  },
}
const customLPHandlers = {
  kava: { SCPLP, },
  klaytn: {
    kslp: {
      lpFilter: (symbol, addr, chain) => chain === 'klaytn' && symbol === 'KSLP',
      abis: {
        getReservesABI: kslpABI.getCurrentPool,
        token0ABI: kslpABI.tokenA,
        token1ABI: kslpABI.tokenB,
      },
    }
  },
  scroll: { syncswap, },
  era: { syncswap, },
}

module.exports = {
  getTokenPrices, sumUnknownTokens, getLPData, getLPList,
}
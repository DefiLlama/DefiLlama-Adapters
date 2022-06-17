
const sdk = require('@defillama/sdk');
const symbol = require('./abis/symbol.json')
const token0 = require('./abis/token0.json');
const token1 = require('./abis/token1.json');
const getReserves = require('./abis/getReserves.json');
const { getChainTransform, stripTokenHeader, getFixBalances, } = require('./portedTokens')
const { requery, } = require('./getUsdUniTvl')
const { sumTokens, } = require('./unwrapLPs')
const { isLP, getUniqueAddresses, DEBUG_MODE } = require('./utils')
const factoryAbi = require('./abis/factory.json');
const { getBlock } = require('./getBlock');
const { default: BigNumber } = require('bignumber.js')

async function getLPData({
  block,
  chain = 'ethereum',
  lps = [], // list of token addresses (all need not be LPs, code checks and filters out non LPs)
  allLps = false,   // if set true, assumes all tokens provided as lps are lps and skips validation/filtering
}) {
  lps = getUniqueAddresses(lps)
  const pairAddresses = allLps ? lps : await getLPList(lps)
  const pairCalls = pairAddresses.map((pairAddress) => ({ target: pairAddress, }))
  let token0Addresses, token1Addresses, reserves

  [token0Addresses, token1Addresses, reserves] = await Promise.all([
    sdk.api.abi.multiCall({ abi: token0, chain, calls: pairCalls, block, }).then(({ output }) => output),
    sdk.api.abi.multiCall({ abi: token1, chain, calls: pairCalls, block, }).then(({ output }) => output),
  ]);
  await requery(token0Addresses, chain, block, token0);
  await requery(token1Addresses, chain, block, token1);
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

  async function getLPList(lps) {
    const callArgs = lps.map(t => ({ target: t }))
    let symbols = (await sdk.api.abi.multiCall({ calls: callArgs, abi: symbol, block, chain })).output
    symbols = symbols.filter(item => isLP(item.output, item.input.target, chain))
    // if (DEBUG_MODE) console.log(symbols.filter(item => item.output !== 'Cake-LP').map(i => `token: ${i.input.target} Symbol: ${i.output}`).join('\n'))
    if (DEBUG_MODE) console.log('LP symbols:', getUniqueAddresses(symbols.map(i => i.output)).join(', '))
    return symbols.map(item => item.input.target.toLowerCase())
  }
}

async function getTokenPrices({
  block,
  chain = 'ethereum',
  coreAssets = [],  // list of tokens that can used as base token to price unknown tokens against (Note: order matters, is there are two LPs for a token, the core asset with a lower index is used)
  blacklist = [],   // list of tokens to ignore/blacklist
  whitelist = [],   // if set, tvl/price is computed only for these tokens
  lps = [], // list of token addresses (all need not be LPs, code checks and filters out non LPs)
  transformAddress, // function for transforming token address to coingecko friendly format
  allLps = false,   // if set true, assumes all tokens provided as lps are lps and skips validation/filtering
  minLPRatio = 0.5, // if a token pool has less that this percent of core asset tokens compared to a token pool with max tokens for a given core asset, this token pool is not used for price calculation
  restrictTokenPrice = false, // if enabled, while computed tvl, an unknown token value can max 
  log_coreAssetPrices = [],
  log_minTokenValue = 1e6 // log only if token value is higer than this value, now minimum is set as 1 million
}) {
  let counter = 0
  if (!transformAddress)
    transformAddress = await getChainTransform(chain)

  coreAssets = coreAssets.map(i => i.toLowerCase())
  blacklist = blacklist.map(i => i.toLowerCase())
  whitelist = whitelist.map(i => i.toLowerCase())
  lps = getUniqueAddresses(lps)
  const pairAddresses = allLps ? lps : await getLPList(lps)
  const pairCalls = pairAddresses.map((pairAddress) => ({ target: pairAddress, }))

  let token0Addresses, token1Addresses, reserves

  [token0Addresses, token1Addresses, reserves] = await Promise.all([
    sdk.api.abi.multiCall({ abi: token0, chain, calls: pairCalls, block, }).then(({ output }) => output),
    sdk.api.abi.multiCall({ abi: token1, chain, calls: pairCalls, block, }).then(({ output }) => output),
    sdk.api.abi.multiCall({ abi: getReserves, chain, calls: pairCalls, block, }).then(({ output }) => output),
  ]);
  await requery(token0Addresses, chain, block, token0);
  await requery(token1Addresses, chain, block, token1);
  await requery(reserves, chain, block, getReserves);


  const pairs = {};
  // add token0Addresses
  token0Addresses.forEach((token0Address) => {
    const tokenAddress = token0Address.output.toLowerCase();

    const pairAddress = token0Address.input.target.toLowerCase();
    pairs[pairAddress] = {
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
      if (!reserveAmounts) console.log('missing reserves', pairAddress)
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

  filterPrices(prices)
  const balances = {}
  Object.keys(pairBalances).forEach(key => addBalances(pairBalances[key], balances, { pairAddress: key }))
  const fixBalances = await getFixBalances(chain)
  fixBalances(balances)

  return {
    pairs,
    updateBalances,
    pairBalances,
    prices,
    balances,
  }

  async function getLPList(lps) {
    const callArgs = lps.map(t => ({ target: t }))
    let symbols = (await sdk.api.abi.multiCall({ calls: callArgs, abi: symbol, block, chain })).output
    symbols = symbols.filter(item => isLP(item.output, item.input.target, chain))
    // if (DEBUG_MODE) console.log(symbols.filter(item => item.output !== 'Cake-LP').map(i => `token: ${i.input.target} Symbol: ${i.output}`).join('\n'))
    if (DEBUG_MODE) console.log('LP symbols:', getUniqueAddresses(symbols.map(i => i.output)).join(', '))
    return symbols.map(item => item.input.target.toLowerCase())
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
    if (DEBUG_MODE) console.log('---updating balances-----')
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
      if (restrictTokenPrice && +amount > tokensInLP) tokenAmount = coreTokenAmountInLP  // use token amount in pool if balances amount is higher than amount in pool
      if (DEBUG_MODE && tokenAmount * getAssetPrice(coreAsset) > log_minTokenValue)
        console.log(`[converting balances] token vaule (in millions): ${(tokenAmount * getAssetPrice(coreAsset) / 1e6).toFixed(4)}, token value higher than pool: ${+amount > +tokensInLP} token: ${token} counter: ${++counter}`)
      sdk.util.sumSingleBalance(balances, transformAddress(coreAsset), BigNumber(tokenAmount).toFixed(0))
      delete balances[address]
    })

    if (!resolveLP) return balances

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
        if (restrictTokenPrice && +amount > tokensInLP) tokenAmount = coreTokenAmountInLP
        if (DEBUG_MODE && tokenAmount * getAssetPrice(coreAsset) * ratio > log_minTokenValue)
          console.log(`[resolve LP balance] token vaule (in millions): ${(tokenAmount * getAssetPrice(coreAsset) * ratio / 1e6).toFixed(4)}, token value higher than pool: ${+amount > +tokensInLP} LP Address: ${pairAddress} token: ${address} ratio: ${ratio} counter: ${++counter}`)
        sdk.util.sumSingleBalance(finalBalances, transformAddress(coreAsset), BigNumber(tokenAmount * ratio).toFixed(0))
      } else {
        if ((DEBUG_MODE && coreAssets.includes(address)) && (+amount * getAssetPrice(address) * ratio > log_minTokenValue))
          console.log(`[resolve LP balance] token vaule (in millions): ${(+amount * getAssetPrice(address) * ratio / 1e6).toFixed(4)}, LP Address: ${pairAddress}  core token: ${address} ratio: ${ratio} counter: ${++counter}`)
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

function getUniTVL({ chain = 'ethereum', coreAssets = [], blacklist = [], whitelist = [], factory, transformAddress, allowUndefinedBlock = true,
  minLPRatio = 1,
  log_coreAssetPrices = [], log_minTokenValue = 1e6,
  withMetaData = false,
}) {
  return async (ts, _block, chainBlocks) => {
    let pairAddresses;
    const block = await getBlock(ts, chain, chainBlocks, allowUndefinedBlock)
    const pairLength = (await sdk.api.abi.call({ target: factory, abi: factoryAbi.allPairsLength, chain, block })).output
    if (pairLength === null)
      throw new Error("allPairsLength() failed")

    if (DEBUG_MODE) console.log('No. of pairs: ', pairLength)

    const pairNums = Array.from(Array(Number(pairLength)).keys())
    let pairs = (await sdk.api.abi.multiCall({ abi: factoryAbi.allPairs, chain, calls: pairNums.map(num => ({ target: factory, params: [num] })), block, requery: true })).output
    await requery(pairs, chain, block, factoryAbi.allPairs);

    pairAddresses = pairs.map(result => result.output.toLowerCase())

    const response = await getTokenPrices({
      block, chain, coreAssets, blacklist, lps: pairAddresses, transformAddress, whitelist, allLps: true,
      minLPRatio, log_coreAssetPrices, log_minTokenValue,
    })
    return withMetaData ? response : response.balances
  }
}

function unknownTombs({ token, shares = [], rewardPool = [], masonry = [], lps, chain = "ethereum", coreAssets = [], }) {
  let getPrices

  if (!Array.isArray(shares) && typeof shares === 'string')
    shares = [shares]
  if (!Array.isArray(masonry) && typeof masonry === 'string')
    masonry = [masonry]
  if (!Array.isArray(rewardPool) && typeof rewardPool === 'string')
    rewardPool = [rewardPool]

  const pool2 = async (timestamp, _block, chainBlocks) => {
    let balances = {};
    const block = chainBlocks[chain]
    if (!getPrices)
      getPrices = getTokenPrices({ block, chain, lps, coreAssets, allLps: true })

    const { updateBalances } = await getPrices

    const tao = []
    lps.forEach(token => rewardPool.forEach(owner => tao.push([token, owner])))

    await sumTokens(balances, tao, block, chain, undefined, { resolveLP: true })
    await updateBalances(balances)
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

    await sumTokens(balances, tao, block, chain)
    await updateBalances(balances)
    return balances
  }

  return {
    [chain === "avax" ? "avalanche" : chain]: {
      tvl: async () => ({}),
      staking,
      pool2
    }
  }

}

function pool2({ stakingContract, lpToken, chain = "ethereum", transformAddress, coreAsset }) {
  return async (_timestamp, _ethBlock, chainBlocks) => {
    const block = chainBlocks[chain]
    if (!transformAddress)
      transformAddress = await getChainTransform(chain)

    const balances = await sumTokens({}, [[lpToken, stakingContract]], block, chain, transformAddress, { resolveLP: true })
    const { updateBalances } = await getTokenPrices({ block, chain, transformAddress, coreAssets: [coreAsset], lps: [lpToken], allLps: true, })

    await updateBalances(balances, { resolveLP: false, })
    const fixBalances = await getFixBalances(chain)
    fixBalances(balances)
    return balances
  }
}

async function sumTokensSingle({
  coreAssets, balances = {}, owner, tokens, chain, block, restrictTokenPrice = false, blacklist = [], skipConversion, onlyLPs, minLPRatio,
  log_coreAssetPrices = [], log_minTokenValue = 1e6,
}) {
  tokens = getUniqueAddresses(tokens)
  blacklist = getUniqueAddresses(blacklist)
  const toa = tokens.filter(t => !blacklist.includes(t)).map(i => [i, owner])
  const { updateBalances } = await getTokenPrices({ coreAssets, lps: tokens, chain, block, restrictTokenPrice, blacklist, log_coreAssetPrices, log_minTokenValue, minLPRatio })
  await sumTokens(balances, toa, block, chain)
  return updateBalances(balances, { skipConversion, onlyLPs })
}

module.exports = {
  sumTokensSingle,
  getTokenPrices,
  getUniTVL,
  unknownTombs,
  pool2,
  getLPData,
};
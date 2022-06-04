
const sdk = require('@defillama/sdk');
const symbol = require('./abis/symbol.json')
const token0 = require('./abis/token0.json');
const token1 = require('./abis/token1.json');
const getReserves = require('./abis/getReserves.json');
const { getChainTransform, stripTokenHeader, getFixBalances, } = require('./portedTokens')
const { requery, } = require('./getUsdUniTvl')
const { sumTokens, } = require('./unwrapLPs')
const { isLP, getUniqueAddresses, } = require('./utils')
const factoryAbi = require('./abis/factory.json');
const { getBlock } = require('./getBlock');
const { default: BigNumber } = require('bignumber.js');

async function getTokenPrices({ block, chain = 'ethereum', coreAssets = [], blacklist = [], whitelist = [], lps = [], transformAddress, allLps = false, restrictTokenPrice }) {
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
      sdk.util.sumSingleBalance(pairBalances[pairAddress], token0Address, Number(reserveAmounts[1]))
    } else if (coreAssets.includes(token0Address)) {
      sdk.util.sumSingleBalance(pairBalances[pairAddress], token0Address, Number(reserveAmounts[0]) * 2)
      if (!blacklist.includes(token1Address) && (!whitelist.length || whitelist.includes(token1Address))) {
        setPrice(prices, token1Address, reserveAmounts[0], reserveAmounts[1], token0Address)
      }
    } else if (coreAssets.includes(token1Address)) {
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
    updateBalances,
    pairBalances,
    prices,
    balances,
  }

  async function getLPList(lps) {
    const callArgs = lps.map(t => ({ target: t }))
    let symbols = (await sdk.api.abi.multiCall({ calls: callArgs, abi: symbol, block, chain })).output
    symbols = symbols.filter(item => isLP(item.output, item.input.target, chain))
    // console.log(symbols.filter(item => item.output !== 'Cake-LP').map(i => `token: ${i.input.target} Symbol: ${i.output}`).join('\n'))
    // console.log(getUniqueAddresses(symbols.map(i => i.output)).join(', '))
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

  async function updateBalances(balances, { resolveLP = true, skipConversion = false, } = {}) {
    let lpAddresses = []  // if some of the tokens in balances are LP tokens, we resolve those as well
    Object.entries(balances).forEach(([address, amount = 0]) => {
      const token = stripTokenHeader(address)
      const price = prices[token];
      if (pairBalances[token]) {
        lpAddresses.push(token)
        return;
      }
      if (!price || skipConversion) return;
      const coreAsset = price[2];
      const coreTokenAmountInLP = price[0]
      // if (+amount / 1e22 > 1) console.log(+amount / 1e22 * 2.96, +amount > +coreTokenAmountInLP, token)  // print current token value and token address
      if (restrictTokenPrice && +amount > +coreTokenAmountInLP) amount = coreTokenAmountInLP
      sdk.util.sumSingleBalance(balances, transformAddress(coreAsset), BigNumber(price[1] * +amount).toFixed(0))
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
        const ratio = (+(balances[address]) || 0) / +item.output
        addBalances(pairBalances[token], balances, { ratio, pairAddress: token, skipConversion, })
      })
    }

    return balances
  }

  function addBalances(balances, finalBalances, { skipConversion = false, pairAddress, ratio = 1 }) {
    Object.entries(balances).forEach(([address, amount = 0]) => {
      const price = prices[address];
      // const price =  undefined; // NOTE: this is disabled till, we add a safeguard to limit LP manipulation to inflate token price, like mimimum core asset liquidity to be 10k
      if (price && !skipConversion) {
        const coreTokenAmountInLP = price[0]
        // if (+amount / 1e22 > 1) console.log(+amount / 1e22 * 2.96, +amount > +coreTokenAmountInLP, address, pairAddress)  // print current token value and token address
        if (restrictTokenPrice && +amount > +coreTokenAmountInLP) amount = coreTokenAmountInLP
        const coreAsset = price[2];
        sdk.util.sumSingleBalance(finalBalances, transformAddress(coreAsset), BigNumber(price[1] * +amount * ratio).toFixed(0))
      } else
        sdk.util.sumSingleBalance(finalBalances, transformAddress(address), BigNumber(+amount * ratio).toFixed(0))
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
      if (lpRatio < 0.5) delete prices[token] // current pool has less than 0.5% of tokens compared to pool with highest number of core tokens
    })
  }
}

function getUniTVL({ chain = 'ethereum', coreAssets = [], blacklist = [], whitelist = [], factory, transformAddress, allowUndefinedBlock = true }) {
  return async (ts, _block, chainBlocks) => {
    let pairAddresses;
    const block = await getBlock(ts, chain, chainBlocks, allowUndefinedBlock)
    const pairLength = (await sdk.api.abi.call({ target: factory, abi: factoryAbi.allPairsLength, chain, block })).output
    if (pairLength === null)
      throw new Error("allPairsLength() failed")

    const pairNums = Array.from(Array(Number(pairLength)).keys())
    let pairs = (await sdk.api.abi.multiCall({ abi: factoryAbi.allPairs, chain, calls: pairNums.map(num => ({ target: factory, params: [num] })), block, requery: true })).output
    await requery(pairs, chain, block, factoryAbi.allPairs);

    pairAddresses = pairs.map(result => result.output.toLowerCase())

    const { balances } = await getTokenPrices({ block, chain, coreAssets, blacklist, lps: pairAddresses, transformAddress, whitelist, allLps: true })
    return balances
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

async function sumTokensSingle({ coreAssets, balances = {}, owner, tokens, chain, block, restrictTokenPrice = false, blacklist = [], skipConversion }) {
  tokens = getUniqueAddresses(tokens)
  blacklist = getUniqueAddresses(blacklist)
  const toa = tokens.filter(t => !blacklist.includes(t)).map(i => [i, owner])
  const { updateBalances } = await getTokenPrices({ coreAssets, lps: tokens, chain, block, restrictTokenPrice, blacklist, })
  await sumTokens(balances, toa, block, chain)
  await updateBalances(balances, { skipConversion })
  return balances
}

module.exports = {
  sumTokensSingle,
  getTokenPrices,
  getUniTVL,
  unknownTombs,
  pool2,
};
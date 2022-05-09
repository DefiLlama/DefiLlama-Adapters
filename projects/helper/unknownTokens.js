
const sdk = require('@defillama/sdk');
const symbol = require('./abis/symbol.json')
const token0 = require('./abis/token0.json');
const token1 = require('./abis/token1.json');
const getReserves = require('./abis/getReserves.json');
const { getChainTransform, stripTokenHeader, getFixBalances, } = require('./portedTokens')
const { requery, } = require('./getUsdUniTvl')
const { sumTokens, } = require('./unwrapLPs')
const { isLP, parallelAbiCall } = require('./utils')
const factoryAbi = require('./abis/factory.json');
const { getBlock } = require('./getBlock');
const { default: BigNumber } = require('bignumber.js');

async function getTokenPrices({ block, chain = 'ethereum', coreAssets = [], blacklist = [], whitelist = [], lps = [], transformAddress, maxParallel, allLps = false }) {
  if (!transformAddress)
    transformAddress = await getChainTransform(chain)

  coreAssets = coreAssets.map(i => i.toLowerCase())
  blacklist = blacklist.map(i => i.toLowerCase())
  whitelist = whitelist.map(i => i.toLowerCase())
  const pairAddresses = allLps ? lps : await getLPList(lps)
  const pairCalls = pairAddresses.map((pairAddress) => ({ target: pairAddress, }))
  let token0Addresses, token1Addresses, reserves

  if (!maxParallel) {
    [token0Addresses, token1Addresses, reserves] = await Promise.all([
      sdk.api.abi.multiCall({ abi: token0, chain, calls: pairCalls, block, }).then(({ output }) => output),
      sdk.api.abi.multiCall({ abi: token1, chain, calls: pairCalls, block, }).then(({ output }) => output),
      sdk.api.abi.multiCall({ abi: getReserves, chain, calls: pairCalls, block, }).then(({ output }) => output),
    ]);
    await requery(token0Addresses, chain, block, token0);
    await requery(token1Addresses, chain, block, token1);
    await requery(reserves, chain, block, getReserves);
  } else {
    token0Addresses = await parallelAbiCall({ block, chain, abi: token0, items: pairCalls, maxParallel, })
    token1Addresses = await parallelAbiCall({ block, chain, abi: token1, items: pairCalls, maxParallel, })
    reserves = await parallelAbiCall({ block, chain, abi: getReserves, items: pairCalls, maxParallel, })
  }

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

  const balances = {}
  Object.values(pairBalances).forEach(pb => addBalances(pb, balances))
  const fixBalances = await getFixBalances(chain)
  fixBalances(balances)

  return {
    updateBalances,
    pairBalances,
    prices,
    balances,
  }

  async function getLPList(lps) {
    let symbols
    const callArgs = lps.map(t => ({ target: t }))
    if (!maxParallel)
      symbols = (await sdk.api.abi.multiCall({ calls: callArgs, abi: symbol, block, chain })).output
    else
      symbols = await parallelAbiCall({ block, chain, abi: symbol, items: callArgs, maxParallel, })
    return symbols.filter(item => isLP(item.output)).map(item => item.input.target.toLowerCase())
  }

  function setPrice(prices, address, coreAmount, tokenAmount, coreAsset) {
    if (prices[address] !== undefined) {
      const currentCoreAmount = prices[address][0]
      const currentCoreAsset = prices[address][2]
      // core asset higher on the list has higher preference
      if (coreAssets.indexOf(currentCoreAmount) < coreAssets.indexOf(coreAsset)) return;
      if ((currentCoreAsset === coreAsset) && coreAmount < currentCoreAmount) return;
    }
    prices[address] = [Number(coreAmount), Number(coreAmount) / Number(tokenAmount), coreAsset]
  }

  async function updateBalances(balances) {
    let lpAddresses = []
    Object.entries(balances).forEach(([address, amount]) => {
      const token = stripTokenHeader(address)
      const price = prices[token];
      if (pairBalances[token]) {
        lpAddresses.push(token)
        return;
      }
      if (!price) return;
      const coreAsset = price[2];
      sdk.util.sumSingleBalance(balances, transformAddress(coreAsset), BigNumber(price[1] * (amount ?? 0)).toFixed())
      delete balances[address]
    })

    if (lpAddresses.length) {
      const totalBalances = (await sdk.api.abi.multiCall({
        abi: 'erc20:totalSupply', calls: lpAddresses.map(i => ({ target: i })), block, chain
      })).output

      totalBalances.forEach((item) => {
        const token = item.input.target
        const address = transformAddress(token)
        const ratio = (+(balances[address]) || 0) / +item.output
        addBalances(pairBalances[token], balances, ratio)
      })
    }

    return balances
  }

  function addBalances(balances, finalBalances, ratio = 1) {
    Object.entries(balances).forEach(([address, amount]) => {
      const price = prices[address];
      if (price !== undefined) {
        const coreAsset = price[2];
        sdk.util.sumSingleBalance(finalBalances, transformAddress(coreAsset), price[1] * (amount ?? 0) * ratio)
      } else
        sdk.util.sumSingleBalance(finalBalances, transformAddress(address), amount * ratio)
    })
  }
}

function getUniTVL({ chain = 'ethereum', coreAssets = [], blacklist = [], whitelist = [], factory, transformAddress, maxParallel, allowUndefinedBlock = true }) {
  return async (ts, _block, chainBlocks) => {
    let pairAddresses;
    const block = await getBlock(ts, chain, chainBlocks, allowUndefinedBlock)
    const pairLength = (await sdk.api.abi.call({ target: factory, abi: factoryAbi.allPairsLength, chain, block })).output
    if (pairLength === null)
      throw new Error("allPairsLength() failed")

    const pairNums = Array.from(Array(Number(pairLength)).keys())
    let pairs

    if (!maxParallel) {
      pairs = (await sdk.api.abi.multiCall({ abi: factoryAbi.allPairs, chain, calls: pairNums.map(num => ({ target: factory, params: [num] })), block })).output
      await requery(pairs, chain, block, factoryAbi.allPairs);
    } else
      pairs = await parallelAbiCall({ block, chain, abi: factoryAbi.allPairs, items: pairNums, maxParallel, getCallArgs: num => ({ params: [num], target: factory }) })

    pairAddresses = pairs.map(result => result.output.toLowerCase())

    const { balances } = await getTokenPrices({ block, chain, coreAssets, blacklist, lps: pairAddresses, transformAddress, maxParallel, whitelist, allLps: true })
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

module.exports = {
  getTokenPrices,
  getUniTVL,
  unknownTombs,
};
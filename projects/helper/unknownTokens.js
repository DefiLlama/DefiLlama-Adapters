
const sdk = require('@defillama/sdk');
const symbol = require('./abis/symbol.json')
const token0 = require('./abis/token0.json');
const token1 = require('./abis/token1.json');
const getReserves = require('./abis/getReserves.json');
const { getChainTransform, stripTokenHeader, } = require('./portedTokens')
const { requery, } = require('./getUsdUniTvl')
const { isLP } = require('./utils')

async function getTokenPrices({ block, chain = 'ethereum', coreAssets = [], blacklist = [], lps = [], transformAddress }) {
  if (!transformAddress)
    transformAddress = await getChainTransform(chain)

  coreAssets = coreAssets.map(i => i.toLowerCase())
  blacklist = blacklist.map(i => i.toLowerCase())
  const pairAddresses = await getLPList(lps)
  const pairCalls = pairAddresses.map((pairAddress) => ({ target: pairAddress, }))

  const [token0Addresses, token1Addresses, reserves] = await Promise.all([
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
      if (!blacklist.includes(token1Address)) {
        setPrice(prices, token1Address, reserveAmounts[0], reserveAmounts[1], token0Address)
      }
    } else if (coreAssets.includes(token1Address)) {
      sdk.util.sumSingleBalance(pairBalances[pairAddress], token1Address, Number(reserveAmounts[1]) * 2)
      if (!blacklist.includes(token1Address)) {
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

  return {
    pairBalances,
    prices,
    updateBalances,
  }

  async function getLPList(lps) {
    const symbols = (await sdk.api.abi.multiCall({
      calls: lps.map(t => ({ target: t })), abi: symbol, block, chain
    })).output
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
      sdk.util.sumSingleBalance(balances, transformAddress(coreAsset), price[1] * (amount ?? 0))
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

module.exports = {
  getTokenPrices,
};
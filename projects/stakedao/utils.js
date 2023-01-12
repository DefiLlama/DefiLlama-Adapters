const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const symbol = require('../helper/abis/symbol.json')
const { getChainTransform, getFixBalances } = require('../helper/portedTokens')
const { unwrapCrv, resolveCrvTokens } = require('../helper/resolveCrvTokens')
const { isLP, getUniqueAddresses, log, } = require('../helper/utils')

const lpReservesAbi = { "constant": true, "inputs": [], "name": "getReserves", "outputs": [{ "internalType": "uint112", "name": "_reserve0", "type": "uint112" }, { "internalType": "uint112", "name": "_reserve1", "type": "uint112" }, { "internalType": "uint32", "name": "_blockTimestampLast", "type": "uint32" }], "payable": false, "stateMutability": "view", "type": "function" }
const lpSuppliesAbi = { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }
const token0Abi = { "constant": true, "inputs": [], "name": "token0", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }
const token1Abi = { "constant": true, "inputs": [], "name": "token1", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }

const nullAddress = '0x0000000000000000000000000000000000000000'
const gasTokens = [nullAddress, '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee']

async function sumTokens(balances = {}, tokensAndOwners, block, chain = "ethereum", transformAddress, { resolveCrv = false, resolveLP = false, resolveYearn = false, unwrapAll = false, blacklistedLPs = [], skipFixBalances = false, abis = {}, } = {}) {
  if (!transformAddress)
    transformAddress = await getChainTransform(chain)

  let ethBalanceInputs = []

  tokensAndOwners = tokensAndOwners.filter(i => {
    const token = i[0].toLowerCase()
    if (token !== nullAddress && !gasTokens.includes(token))
      return true
    ethBalanceInputs.push(i[1])
    return false
  })

  ethBalanceInputs = getUniqueAddresses(ethBalanceInputs)

  if (ethBalanceInputs.length) {
    const { output: ethBalances } = await sdk.api.eth.getBalances({ targets: ethBalanceInputs, chain, block })
    ethBalances.forEach(({ balance }) => sdk.util.sumSingleBalance(balances, transformAddress(nullAddress), balance))
  }

  const balanceOfTokens = await sdk.api.abi.multiCall({
    calls: tokensAndOwners.map(t => ({
      target: t[0],
      params: t[1]
    })),
    abi: 'erc20:balanceOf',
    block,
    chain
  })
  balanceOfTokens.output.forEach((result, idx) => {
    const token = transformAddress(result.input.target)
    const balance = BigNumber(result.output)
    try {
      balances[token] = BigNumber(balances[token] || 0).plus(balance).toFixed(0)
    } catch (e) {
      console.log(token, balance, balances[token])
      throw e
    }
  })

  Object.entries(balances).forEach(([token, value]) => {
    if (+value === 0) delete balances[token]
  })

  if (resolveLP || unwrapAll)
    await unwrapLPsAuto({ balances, block, chain, transformAddress, blacklistedLPs, abis, })

  if (resolveCrv || unwrapAll)
    await resolveCrvTokens(balances, block, chain, transformAddress)

  if (resolveYearn || unwrapAll) {
    await Promise.all(Object.keys(balances).map(token => unwrapYearn(balances, stripTokenHeader(token), block, chain, transformAddress)))
    await resolveCrvTokens(balances, block, chain, transformAddress)
  }

  if (!skipFixBalances && ['astar', 'harmony', 'kava', 'thundercore', 'klaytn', 'evmos'].includes(chain)) {
    const fixBalances = await getFixBalances(chain)
    fixBalances(balances)
  }

  return balances
}

async function unwrapLPsAuto({ balances, block, chain = "ethereum", transformAddress, excludePool2 = false, onlyPool2 = false, pool2Tokens = [], blacklistedLPs = [], abis = {}, }) {
  if (!transformAddress)
    transformAddress = await getChainTransform(chain)

  pool2Tokens = pool2Tokens.map(token => token.toLowerCase())
  blacklistedLPs = blacklistedLPs.map(token => token.toLowerCase())
  const tokens = []
  const amounts = []

  Object.keys(balances).forEach(key => {
    if (+balances[key] === 0) {
      delete balances[key]
      return;
    }
    if (chain === 'ethereum' && key.indexOf(':') > -1) return;  // token is transformed, probably not an LP
    if (chain !== 'ethereum' && !key.startsWith(chain + ':')) return;  // token is transformed, probably not an LP
    const token = stripTokenHeader(key)
    if (!/^0x/.test(token)) return;     // if token is not an eth address, we ignore it
    tokens.push({ output: token })
    amounts.push({ output: balances[key] })
    delete balances[key]
  })

  return _addTokensAndLPs(balances, tokens, amounts)

  async function _addTokensAndLPs(balances, tokens, amounts) {
    const symbols = (await sdk.api.abi.multiCall({
      calls: tokens.map(t => ({ target: t.output })), abi: symbol, block, chain
    })).output
    const lpBalances = []
    symbols.forEach(({ output }, idx) => {
      const token = tokens[idx].output
      const balance = amounts[idx].output
      if (isLP(output, token, chain) && !blacklistedLPs.includes(token.toLowerCase()))
        lpBalances.push({ token, balance })
      else
        sdk.util.sumSingleBalance(balances, transformAddress(token), balance);
    })
    await _unwrapUniswapLPs(balances, lpBalances)
    return balances
  }

  async function _unwrapUniswapLPs(balances, lpPositions) {
    const lpTokenCalls = lpPositions.map(lpPosition => ({ target: lpPosition.token }))
    const { output: lpReserves } = await sdk.api.abi.multiCall({ block, abi: abis.getReservesABI || lpReservesAbi, calls: lpTokenCalls, chain, })
    const { output: lpSupplies } = await sdk.api.abi.multiCall({ block, abi: lpSuppliesAbi, calls: lpTokenCalls, chain, })
    const { output: tokens0 } = await sdk.api.abi.multiCall({ block, abi: token0Abi, calls: lpTokenCalls, chain, })
    const { output: tokens1 } = await sdk.api.abi.multiCall({ block, abi: token1Abi, calls: lpTokenCalls, chain, })

    lpPositions.map(lpPosition => {
      try {
        let token0, token1, supply
        const lpToken = lpPosition.token
        const token0_ = tokens0.find(call => call.input.target === lpToken)
        const token1_ = tokens1.find(call => call.input.target === lpToken)
        const supply_ = lpSupplies.find(call => call.input.target === lpToken)
        try {
          token0 = token0_.output.toLowerCase()
          token1 = token1_.output.toLowerCase()
          supply = supply_.output
        } catch (e) {
          console.log('Unable to resolve LP: ', lpToken);
          throw e
        }

        if (excludePool2)
          if (pool2Tokens.includes(token0) || pool2Tokens.includes(token1)) return;

        if (onlyPool2)
          if (!pool2Tokens.includes(token0) && !pool2Tokens.includes(token1)) return;

        if (supply === "0") {
          return
        }

        let _reserve0, _reserve1
        let output = lpReserves.find(call => call.input.target === lpToken);
        _reserve0 = output.output._reserve0 || output.output.reserve0
        _reserve1 = output.output._reserve1 || output.output.reserve1

        const token0Balance = BigNumber(lpPosition.balance).times(BigNumber(_reserve0)).div(BigNumber(supply)).toFixed(0)
        const token1Balance = BigNumber(lpPosition.balance).times(BigNumber(_reserve1)).div(BigNumber(supply)).toFixed(0)
        sdk.util.sumSingleBalance(balances, transformAddress(token0), token0Balance)
        sdk.util.sumSingleBalance(balances, transformAddress(token1), token1Balance)
      } catch (e) {
        console.log(`Failed to get data for LP token at ${lpPosition.token} on chain ${chain}`)
        throw e
      }
    })
  }
}

function stripTokenHeader(token) {
  return token.indexOf(':') > -1 ? token.split(':')[1] : token
}

async function sumTokens3({
  balancesPromise = async function() {return{}},
  tokensAndOwnersPromise = async function () {return[]},
  tokens = [],
  owners = [],
  owner,
  block,
  chain = 'ethereum',
  transformAddress,
  resolveCrv = false,
  resolveLP = false,
  resolveYearn = false,
  unwrapAll = false,
  blacklistedLPs = [],
  blacklistedTokens = [],
  skipFixBalances = false,
  abis = {},
}) {
  balances = await balancesPromise();
  tokensAndOwners = await tokensAndOwnersPromise();
  if (!tokensAndOwners.length) {
    tokens = getUniqueAddresses(tokens)
    owners = getUniqueAddresses(owners)
    if (owner) tokensAndOwners = tokens.map(t => [t, owner])
    if (owners.length) tokensAndOwners = tokens.map(t => owners.map(o => [t, o])).flat()
  }

  blacklistedTokens = blacklistedTokens.map(t => t.toLowerCase())
  tokensAndOwners = tokensAndOwners.map(([t, o]) => [t.toLowerCase(), o]).filter(([token]) => !blacklistedTokens.includes(token))
  tokensAndOwners = getUniqueToA(tokensAndOwners)
  log(chain, 'summing tokens', tokensAndOwners.length)

  await sumTokens(balances, tokensAndOwners, block, chain, transformAddress, { resolveCrv, resolveLP, resolveYearn, unwrapAll, blacklistedLPs, skipFixBalances: true, abis, })

  if (!skipFixBalances) {
    const fixBalances = await getFixBalances(chain)
    fixBalances(balances)
  }

  return balances

  function getUniqueToA(toa) {
    toa = toa.map(i => i.join('-'))
    return getUniqueAddresses(toa).map(i => i.split('-'))
  }
}

function sumTokensExportPromise({ balancesPromise, tokensAndOwnersPromise, tokens, owner, owners, chain = 'ethereum', transformAddress, unwrapAll, resolveLP, blacklistedLPs, blacklistedTokens, skipFixBalances }) {
  return async (_, _b, { [chain]: block }) => sumTokens3({ balancesPromise, tokensAndOwnersPromise, tokens, owner, owners, chain, block, transformAddress, unwrapAll, resolveLP, blacklistedLPs, blacklistedTokens, skipFixBalances })
}


module.exports = {
  unwrapCrv,
  sumTokensExportPromise
}

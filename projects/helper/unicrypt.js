const BigNumber = require('bignumber.js');
const sdk = require('@defillama/sdk');

const { unwrapUniswapLPs } = require("./unwrapLPs");

const token0 = require('./abis/token0.json');
const token1 = require('./abis/token1.json');

const getPairFactory = require('./abis/getPair.json') 


async function getUnicryptLpsCoreValue(
  block,
  chain,
  contract, // locker contract address.
  getNumLockedTokensABI, // ABI to retrieve the total amount of tokens locked.
  getLockedTokenAtIndexABI, // ABI to retrieve tokens at a specific lock index.
  trackedTokens = [], // liquid assets for tokens to be paired against (ETH, USD etc.).
  pool2 = [], // pool2 pair to be excluded from the balances.
  isMixedTokenContract = false,
  factory = null
  ) {

  let balances = {}

  const getLocks = Number(
    (
      await sdk.api.abi.call({
        abi: getNumLockedTokensABI,
        target: contract,
        chain: chain,
        block: block,
      })
    ).output
  );
  
  let lockedLPs = [];
  const lockIds = Array.from(Array(getLocks).keys());
  {
  
  const lps = (
    await sdk.api.abi.multiCall({
      abi: getLockedTokenAtIndexABI,
      calls: lockIds.map((lockid) => ({
        target: contract,
        params: lockid,
      })),
      chain: chain,
      block: block,
    })
  )
  .output

  lps.forEach(lp => {
    if (lp.success && (!pool2.includes(lp))) {
      const lpToken = lp.output.toLowerCase()
      lockedLPs.push(lpToken)
    }
  })  
}

  return (isMixedTokenContract) ? // check if purely an lp locker or contains lps and tokens 
  getTokensAndLPsTrackedValue(balances, lockedLPs, contract, factory, trackedTokens, block, chain) :
  getLPsTrackedValue(balances, lockedLPs, contract, factory, trackedTokens, block, chain)
}


async function getTokensAndLPsTrackedValue(balances, lpTokens, contract, factory, trackedTokens, block, chain) {

  if (!Array.isArray(trackedTokens)) throw new Error("must pass an array of base tokens to trackedTokens")

  const [token0Addresses, token1Addresses, tokenBalances] = await Promise.all([
    sdk.api.abi
    .multiCall({
        abi: token0,
        chain,
        calls: lpTokens.map((lpToken) => ({
            target: lpToken,
        })),
        block,
    })
    .then(({ output }) => output),
    sdk.api.abi
    .multiCall({
        abi: token1,
        chain,
        calls: lpTokens.map((lpToken) => ({
            target: lpToken,
        })),
        block,
    }).then(({ output }) => output),
    sdk.api.abi.multiCall({
      abi: "erc20:balanceOf",
      chain,
      calls: lpTokens.map(lpToken => ({
        target: lpToken,
        params: contract,
      })),
      block,
    }).then(({ output }) => output)
  ]);

  let lps = {}
  let filteredLps = {}
  let lpBalances = []


  tokenBalances.forEach((balance) => {
    if (balance.success) {
      const lpBalance = balance.output 
      const lpAddress = balance.input.target.toLowerCase()
      lps[lpAddress] = {
          balance: lpBalance,
      }
    }
  });

  token0Addresses.forEach((token0Address) => {
    if (token0Address.success) {
      const pairAddress = token0Address.input.target.toLowerCase();
      lps[pairAddress].token0 = token0Address.output
    }
  });

  token1Addresses.forEach((token1Address) => {
    if (token1Address.success) {
    const pairAddress = token1Address.input.target.toLowerCase();
    lps[pairAddress].token1 = token1Address.output
    }
  });

  Object.entries(lps).forEach(([key, value]) => {
    if (value.token0 && value.token1 && value.balance) {
      if (value.balance > 0) {
        filteredLps[key] = {balance: value.balance} 
        filteredLps[key].token0 = value.token0
        filteredLps[key].token1 = value.token1
      }
    }
  })

  // Check if token is actually a v2 pair
  {const checkedLPToken = (
    await sdk.api.abi.multiCall({
      abi: getPairFactory,
      calls: Object.values(filteredLps).map((value) => ({
        target: factory,
        params: [value.token0, value.token1],
      })),
      chain: chain,
      block: block,
    })
  ).output

  checkedLPToken.forEach(lp => {
    if (lp.success) {
      const lpToken = lp.output.toLowerCase()
      if (lp.success && Object.keys(filteredLps).includes(lpToken)) {
        // check if pair contains both base tokens
        let lpBalance =
        ((trackedTokens.includes(filteredLps[lpToken].token0)   && 
          trackedTokens.includes(filteredLps[lpToken].token1))) ? 
        filteredLps[lpToken].balance :
        BigNumber(filteredLps[lpToken].balance).times(BigNumber(2)).toFixed(0) 

        lpBalances.push({
          balance: lpBalance,
          token: lpToken
        })}
      }
    })
  }

  await unwrapUniswapLPs(balances, lpBalances, block, chain, (addr) => `${chain}:${addr}`);


  let formattedWhitelist = trackedTokens.map(address => `${chain}:${address}`)

  balances = Object.keys(balances)
  .filter(balance => formattedWhitelist.includes(balance))
  .reduce((obj, balance) => {
    obj[balance] = balances[balance];
    return obj;
  }, {});

  return balances;
}

async function getLPsTrackedValue(balances, lpTokens, contract, factory, trackedTokens, block, chain) {

  if (!Array.isArray(trackedTokens)) throw new Error("must pass an array of base tokens to trackedTokens")
  
  // get pairs made of 2 core assets to avoid double counting their balances

  let matchedBaseTokens = []
  if (trackedTokens.length > 1) {
    trackedTokens.forEach(token0 => 
    trackedTokens.forEach(token1 => {
    if (!(token0 == token1)) 
    matchedBaseTokens.push([token0, token1])
  }))
  }

  let whitelistedBasePairs = new Set()
  
{  const basePairs = (
    await sdk.api.abi.multiCall({
      abi: getPairFactory,
      calls: Object.values(matchedBaseTokens).map((value) => ({
        target: factory,
        params: value,
      })),
      chain: chain,
      block: block,
    })
  ).output

  basePairs.forEach(pair => {
    if (pair.success) {
      const basePair = pair.output.toLowerCase()
      if (basePair != '0x0000000000000000000000000000000000000000') 
      whitelistedBasePairs.add(basePair)}
    }
  )
}

  let lps = []
{
  const tokenBalances = (await sdk.api.abi.multiCall({
    abi: "erc20:balanceOf",
    calls: lpTokens.map((lpToken) => ({
      target: lpToken,
      params: contract,
    })),
    chain: chain,
    block: block,
    })).output
  

  tokenBalances.forEach((balance) => {
    if (balance.success) {
      const lpAddress = balance.input.target.toLowerCase()
      let lpBalance = (whitelistedBasePairs.has(lpAddress)) ? 
      balance.output : BigNumber(balance.output).times(BigNumber(2)).toFixed(0)
      if (lpBalance > 0) {
        lps[lpAddress] = lpBalance
      }
    }
  });
}

let lpBalances = []

  Object.entries(lps).forEach(([key, value]) => {
    lpBalances.push({
      balance: value,
      token: key
    })
  })   

  await unwrapUniswapLPs(balances, lpBalances, block, chain, (addr) => `${chain}:${addr}`);

  let formattedWhitelist = trackedTokens.map(address => `${chain}:${address}`)

  balances = Object.keys(balances)
  .filter(balance => formattedWhitelist.includes(balance))
  .reduce((obj, balance) => {
    obj[balance] = balances[balance];
    return obj;
  }, {});

  return balances;
}


module.exports = {
  getUnicryptLpsCoreValue,
  getTokensAndLPsTrackedValue,
  getLPsTrackedValue
}


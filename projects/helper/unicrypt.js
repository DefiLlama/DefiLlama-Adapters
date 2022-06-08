const BigNumber = require('bignumber.js');
const sdk = require('@defillama/sdk');

const { unwrapUniswapLPs } = require("./unwrapLPs");

const token0 = require('./abis/token0.json');
const token1 = require('./abis/token1.json');

const getPairFactory = require('./abis/getPair.json') 


async function getUnicryptLpsCoreValue(
  block,
  chain,
  contract,
  getNumLockedTokensABI,
  getLockedTokenAtIndexABI, 
  trackedTokens, // liquid assets for tokens to be paired against
  pool2 = [], // pool2 pair to be excluded from the balances
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

  return (isMixedTokenContract) ? //check if purely an lp locker or contains lps and tokens 
  getTokensAndLPsTrackedValue(balances, lockedLPs, contract, factory, trackedTokens, block, chain) :
  getLPsTrackedValue(balances, lockedLPs, contract, trackedTokens, block, chain)
}


async function getTokensAndLPsTrackedValue(balances, lpTokens, contract, factory, trackedTokens, block, chain) {

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
      const lpBalance = BigNumber(balance.output).times(BigNumber(2)).toFixed(0)
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
        lpBalances.push({
          balance: filteredLps[lpToken].balance,
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



async function getLPsTrackedValue(balances, lpTokens, contract, trackedTokens, block, chain) {

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
      const lpBalance = BigNumber(balance.output).times(BigNumber(2)).toFixed(0)
      const lpAddress = balance.input.target.toLowerCase()
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

